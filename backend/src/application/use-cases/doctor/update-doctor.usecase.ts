import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IDoctorRepository } from '../../../domain/repositories/doctor.repository.interface';
import type { IClinicRentalRepository } from '../../../domain/repositories/clinic-rental.repository.interface';
import { Doctor, WeekdayNumber, ShiftType } from '../../../domain/entities/doctor.entity';
import { UpdateDoctorDto } from '../../dtos/update-doctor.dto';

@Injectable()
export class UpdateDoctorUseCase {
    private readonly logger = new Logger(UpdateDoctorUseCase.name);

    constructor(
        @Inject('IDoctorRepository')
        private readonly doctorRepository: IDoctorRepository,
        @Inject('IClinicRentalRepository')
        private readonly clinicRentalRepository: IClinicRentalRepository,
    ) { }

    async execute(id: string, dto: UpdateDoctorDto): Promise<Doctor> {
        const oldDoctor = await this.doctorRepository.findById(id);
        if (!oldDoctor) {
            throw new Error('Doctor not found');
        }

        // Check if schedule pattern is actually changing
        const typeChanged = dto.type !== undefined && dto.type !== oldDoctor.type;
        const shiftChanged = dto.fixedShift !== undefined && dto.fixedShift !== oldDoctor.fixedShift;
        const weekdaysChanged = dto.fixedWeekdays !== undefined && 
            JSON.stringify(dto.fixedWeekdays) !== JSON.stringify(oldDoctor.fixedWeekdays);
        const startDateChanged = dto.fixedStartDate !== undefined && 
            (dto.fixedStartDate ? new Date(dto.fixedStartDate).getTime() : 0) !== (oldDoctor.fixedStartDate ? oldDoctor.fixedStartDate.getTime() : 0);
        const endDateChanged = dto.fixedEndDate !== undefined && 
            (dto.fixedEndDate ? new Date(dto.fixedEndDate).getTime() : 0) !== (oldDoctor.fixedEndDate ? oldDoctor.fixedEndDate.getTime() : 0);

        const scheduleChanged = typeChanged || shiftChanged || weekdaysChanged || startDateChanged || endDateChanged;

        if (scheduleChanged) {
            this.logger.log(`Schedule changed for doctor ${oldDoctor.name}. Cleaning up future automated rentals in bulk...`);
            const today = new Date();
            today.setHours(12, 0, 0, 0); // safe local midday

            await this.clinicRentalRepository.deleteFutureAutomatedRentals(id, today);
        }

        // Cast types to match entity definition
        const updateData: Partial<Doctor> = {
            ...dto,
            fixedWeekdays: dto.fixedWeekdays as WeekdayNumber[] | undefined,
            fixedShift: dto.fixedShift as ShiftType | undefined,
            fixedStartDate: dto.fixedStartDate ? new Date(dto.fixedStartDate) : dto.fixedStartDate === null ? null : undefined,
            fixedEndDate: dto.fixedEndDate ? new Date(dto.fixedEndDate) : dto.fixedEndDate === null ? null : undefined,
        };

        const updatedDoctor = await this.doctorRepository.update(id, updateData);

        if (scheduleChanged && updatedDoctor.type === 'fixed' && updatedDoctor.fixedWeekdays?.length && updatedDoctor.fixedShift) {
            await this.generateMonthlyRentals(updatedDoctor);
        }

        return updatedDoctor;
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

