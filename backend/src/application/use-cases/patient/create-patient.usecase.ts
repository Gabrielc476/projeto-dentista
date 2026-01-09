import { Injectable, Inject } from '@nestjs/common';
import type { IPatientRepository } from '../../../domain/repositories/patient.repository.interface';
import { Patient } from '../../../domain/entities/patient.entity';
import { CreatePatientDto } from '../../dtos/input/create-patient.dto';

@Injectable()
export class CreatePatientUseCase {
    constructor(
        @Inject('IPatientRepository')
        private readonly patientRepository: IPatientRepository,
    ) { }

    async execute(dto: CreatePatientDto): Promise<Patient> {
        const patientData = {
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            cpf: dto.cpf,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
            address: dto.address,
            notes: dto.notes,
        };

        return await this.patientRepository.create(patientData);
    }
}
