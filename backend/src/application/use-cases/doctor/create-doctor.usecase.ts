import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IDoctorRepository } from '../../../domain/repositories/doctor.repository.interface';
import type { IClinicRentalRepository } from '../../../domain/repositories/clinic-rental.repository.interface';
import { Doctor, WeekdayNumber, ShiftType } from '../../../domain/entities/doctor.entity';
import { CreateDoctorDto } from '../../dtos/create-doctor.dto';

@Injectable()
export class CreateDoctorUseCase {
    private readonly logger = new Logger(CreateDoctorUseCase.name);

    constructor(
        @Inject('IDoctorRepository')
        private readonly doctorRepository: IDoctorRepository,
        @Inject('IClinicRentalRepository')
        private readonly clinicRentalRepository: IClinicRentalRepository,
    ) { }

    async execute(dto: CreateDoctorDto): Promise<Doctor> {
        const doctorData = {
            name: dto.name,
            phone: dto.phone,
            type: dto.type,
            notes: dto.notes,
            fixedWeekdays: dto.fixedWeekdays as WeekdayNumber[],
            fixedShift: dto.fixedShift as ShiftType,
            fixedStartDate: dto.fixedStartDate ? new Date(dto.fixedStartDate) : undefined,
            fixedEndDate: dto.fixedEndDate ? new Date(dto.fixedEndDate) : undefined,
        };

        // Create the doctor first
        const doctor = await this.doctorRepository.create(doctorData);

        // If fixed doctor has a schedule pattern, auto-generate rentals
        if (doctor.type === 'fixed' && doctor.fixedWeekdays?.length && doctor.fixedShift) {
            await this.generateMonthlyRentals(doctor);
        }

        return doctor;
    }

    private async generateMonthlyRentals(doctor: Doctor): Promise<void> {
        this.logger.log(`Generating monthly rentals for fixed doctor: ${doctor.name}`);

        const today = new Date();
        today.setHours(12, 0, 0, 0);

        let startDate = today;
        if (doctor.fixedStartDate) {
            const docStart = new Date(doctor.fixedStartDate);
            const docStartLocal = new Date(
                docStart.getUTCFullYear(),
                docStart.getUTCMonth(),
                docStart.getUTCDate(),
                12, 0, 0, 0
            );
            if (docStartLocal > startDate) {
                startDate = docStartLocal;
            }
        }

        let endDate: Date;
        if (doctor.fixedEndDate) {
            const docEnd = new Date(doctor.fixedEndDate);
            endDate = new Date(
                docEnd.getUTCFullYear(),
                docEnd.getUTCMonth(),
                docEnd.getUTCDate(),
                12, 0, 0, 0
            );
        } else {
            // Default: 12 months from startDate
            endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 12);
            endDate.setHours(12, 0, 0, 0);
        }

        // Get all days in the range that match the doctor's fixed weekdays
        const daysToCreate: Date[] = [];
        const current = new Date(startDate);
        current.setHours(12, 0, 0, 0);

        const safeEndDate = new Date(endDate);
        safeEndDate.setHours(12, 0, 0, 0);

        while (current <= safeEndDate) {
            const weekday = current.getDay() as WeekdayNumber;

            if (doctor.fixedWeekdays!.includes(weekday)) {
                daysToCreate.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }

        this.logger.log(`Found ${daysToCreate.length} candidate days for doctor ${doctor.name}`);

        if (daysToCreate.length === 0) return;

        try {
            // 1. Fetch all existing rentals in the entire range in a single query
            const existingRentals = await this.clinicRentalRepository.findByDateRange(startDate, endDate);

            // 2. Index existing rentals by "date" key for O(1) checks, using UTC components to match DB DATE type
            const existingKeys = new Set(
                existingRentals
                    .filter(r => r.shift === doctor.fixedShift)
                    .map(r => {
                        const d = r.date instanceof Date ? r.date : new Date(r.date);
                        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
                    })
            );

            // 3. Filter candidates that do not exist yet
            const rentalsToInsert = daysToCreate
                .filter(date => {
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    const isOccupied = existingKeys.has(dateStr);
                    if (isOccupied) {
                        this.logger.warn(`Slot ${dateStr} ${doctor.fixedShift} already occupied`);
                    }
                    return !isOccupied;
                })
                .map(date => ({
                    doctorId: doctor.id,
                    date,
                    shift: doctor.fixedShift!,
                    notes: 'Gerado automaticamente',
                }));

            this.logger.log(`Inserting ${rentalsToInsert.length} new rentals for doctor ${doctor.name}...`);

            // 4. Bulk insert all new slots in a single batch query
            await this.clinicRentalRepository.createMany(rentalsToInsert);

            this.logger.log(`Successfully generated ${rentalsToInsert.length} rentals for doctor ${doctor.name}`);
        } catch (error) {
            this.logger.error(`Failed to generate monthly rentals for doctor ${doctor.name}: ${error.message}`);
        }
    }
}

