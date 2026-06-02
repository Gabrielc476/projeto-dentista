import { Injectable, Inject } from '@nestjs/common';
import type { IClinicRentalRepository } from '../../../domain/repositories/clinic-rental.repository.interface';
import { ClinicRental } from '../../../domain/entities/clinic-rental.entity';

@Injectable()
export class ListClinicRentalsUseCase {
    constructor(
        @Inject('IClinicRentalRepository')
        private readonly clinicRentalRepository: IClinicRentalRepository,
    ) { }

    async execute(startDate?: string, endDate?: string, doctorId?: string): Promise<ClinicRental[]> {
        if (doctorId) {
            return await this.clinicRentalRepository.findByDoctorId(doctorId);
        }

        if (startDate && endDate) {
            return await this.clinicRentalRepository.findByDateRange(
                new Date(startDate),
                new Date(endDate)
            );
        }

        return await this.clinicRentalRepository.findAll();
    }
}
