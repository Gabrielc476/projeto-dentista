import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPatientRepository } from '../../../domain/repositories/patient.repository.interface';

@Injectable()
export class DeletePatientUseCase {
    constructor(
        @Inject('IPatientRepository')
        private readonly patientRepository: IPatientRepository,
    ) { }

    async execute(id: string): Promise<void> {
        const patient = await this.patientRepository.findById(id);

        if (!patient) {
            throw new NotFoundException(`Patient with ID ${id} not found`);
        }

        await this.patientRepository.delete(id);
    }
}
