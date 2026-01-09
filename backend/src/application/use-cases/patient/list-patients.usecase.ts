import { Injectable, Inject } from '@nestjs/common';
import type { IPatientRepository } from '../../../domain/repositories/patient.repository.interface';
import { Patient } from '../../../domain/entities/patient.entity';

@Injectable()
export class ListPatientsUseCase {
    constructor(
        @Inject('IPatientRepository')
        private readonly patientRepository: IPatientRepository,
    ) { }

    async execute(): Promise<Patient[]> {
        return await this.patientRepository.findAll();
    }
}
