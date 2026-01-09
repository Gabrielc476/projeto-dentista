import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPatientRepository } from '../../../domain/repositories/patient.repository.interface';
import { Patient } from '../../../domain/entities/patient.entity';
import { UpdatePatientDto } from '../../dtos/input/update-patient.dto';

@Injectable()
export class UpdatePatientUseCase {
    constructor(
        @Inject('IPatientRepository')
        private readonly patientRepository: IPatientRepository,
    ) { }

    async execute(id: string, dto: UpdatePatientDto): Promise<Patient> {
        const patient = await this.patientRepository.findById(id);

        if (!patient) {
            throw new NotFoundException(`Patient with ID ${id} not found`);
        }

        const updateData: Partial<Patient> = {
            ...dto,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        };

        return await this.patientRepository.update(id, updateData);
    }
}
