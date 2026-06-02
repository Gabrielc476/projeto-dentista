import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IClinicRentalRepository } from '../../../domain/repositories/clinic-rental.repository.interface';
import { ClinicRental, ShiftType } from '../../../domain/entities/clinic-rental.entity';
import { UpdateClinicRentalDto } from '../../dtos/update-clinic-rental.dto';

@Injectable()
export class UpdateClinicRentalUseCase {
    constructor(
        @Inject('IClinicRentalRepository')
        private readonly clinicRentalRepository: IClinicRentalRepository,
    ) { }

    async execute(id: string, dto: UpdateClinicRentalDto): Promise<ClinicRental> {
        // If changing date or shift, check for conflicts
        if (dto.date || dto.shift) {
            const currentRental = await this.clinicRentalRepository.findById(id);
            if (!currentRental) {
                throw new BadRequestException('Locação não encontrada');
            }

            const checkDate = dto.date ? new Date(dto.date) : currentRental.date;
            const checkShift = (dto.shift || currentRental.shift) as ShiftType;

            const existingRental = await this.clinicRentalRepository.findByDateAndShift(
                checkDate,
                checkShift
            );

            if (existingRental && existingRental.id !== id) {
                throw new BadRequestException(
                    `Este turno já está ocupado por ${existingRental.doctorName || 'outro médico'}`
                );
            }
        }

        const updateData: Partial<ClinicRental> = {};
        if (dto.doctorId) updateData.doctorId = dto.doctorId;
        if (dto.date) updateData.date = new Date(dto.date);
        if (dto.shift) updateData.shift = dto.shift as ShiftType;
        if (dto.notes !== undefined) updateData.notes = dto.notes;

        return await this.clinicRentalRepository.update(id, updateData);
    }
}
