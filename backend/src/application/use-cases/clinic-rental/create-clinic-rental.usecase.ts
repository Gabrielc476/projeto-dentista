import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IClinicRentalRepository } from '../../../domain/repositories/clinic-rental.repository.interface';
import { ClinicRental, ShiftType } from '../../../domain/entities/clinic-rental.entity';
import { CreateClinicRentalDto } from '../../dtos/create-clinic-rental.dto';

@Injectable()
export class CreateClinicRentalUseCase {
    constructor(
        @Inject('IClinicRentalRepository')
        private readonly clinicRentalRepository: IClinicRentalRepository,
    ) { }

    async execute(dto: CreateClinicRentalDto): Promise<ClinicRental> {
        // Check for conflicts (same date and shift)
        const existingRental = await this.clinicRentalRepository.findByDateAndShift(
            new Date(dto.date),
            dto.shift as ShiftType
        );

        if (existingRental) {
            throw new BadRequestException(
                `Este turno já está ocupado por ${existingRental.doctorName || 'outro médico'}`
            );
        }

        const rentalData = {
            doctorId: dto.doctorId,
            date: new Date(dto.date),
            shift: dto.shift as ShiftType,
            notes: dto.notes,
        };

        return await this.clinicRentalRepository.create(rentalData);
    }
}
