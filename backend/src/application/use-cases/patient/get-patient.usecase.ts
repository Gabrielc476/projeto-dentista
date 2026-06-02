import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPatientRepository } from '../../../domain/repositories/patient.repository.interface';
import { Patient } from '../../../domain/entities/patient.entity';

@Injectable()
export class GetPatientUseCase {
    constructor(
        @Inject('IPatientRepository')
        private readonly patientRepository: IPatientRepository,
    ) { }

    async execute(id: string): Promise<Patient> {
        const patient = await this.patientRepository.findById(id);

        if (!patient) {
            throw new NotFoundException(`Patient with ID ${id} not found`);
        }

        return patient;
    }
}
