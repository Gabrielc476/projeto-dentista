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
        };

        // Create the doctor first
        const doctor = await this.doctorRepository.create(doctorData);

        // If fixed doctor has a schedule pattern, auto-generate rentals for current month
        if (doctor.type === 'fixed' && doctor.fixedWeekdays?.length && doctor.fixedShift) {
            await this.generateMonthlyRentals(doctor);
        }

        return doctor;
    }

    private async generateMonthlyRentals(doctor: Doctor): Promise<void> {
        this.logger.log(`Generating monthly rentals for fixed doctor: ${doctor.name}`);

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Get all days in current month that match the doctor's fixed weekdays
        const daysToCreate: Date[] = [];

        // Start from today or first of month (whichever is later)
        const startDay = today.getDate();
        const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let day = startDay; day <= lastDay; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const weekday = date.getDay() as WeekdayNumber;

            if (doctor.fixedWeekdays!.includes(weekday)) {
                daysToCreate.push(date);
            }
        }

        this.logger.log(`Found ${daysToCreate.length} days to create rentals for doctor ${doctor.name}`);

        // Create rentals for each day (skip if already exists)
        let createdCount = 0;
        for (const date of daysToCreate) {
            try {
                // Check if slot is already taken
                const existing = await this.clinicRentalRepository.findByDateAndShift(
                    date,
                    doctor.fixedShift!
                );

                if (!existing) {
                    await this.clinicRentalRepository.create({
                        doctorId: doctor.id,
                        date,
                        shift: doctor.fixedShift!,
                        notes: 'Gerado automaticamente',
                    });
                    createdCount++;
                } else {
                    this.logger.warn(`Slot ${date.toISOString().split('T')[0]} ${doctor.fixedShift} already occupied`);
                }
            } catch (error) {
                this.logger.error(`Error creating rental for ${date.toISOString()}: ${error.message}`);
            }
        }

        this.logger.log(`Created ${createdCount} rentals for doctor ${doctor.name}`);
    }
}

