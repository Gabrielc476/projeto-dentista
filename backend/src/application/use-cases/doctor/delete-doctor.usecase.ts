import { Injectable, Inject } from '@nestjs/common';
import type { IDoctorRepository } from '../../../domain/repositories/doctor.repository.interface';

@Injectable()
export class DeleteDoctorUseCase {
    constructor(
        @Inject('IDoctorRepository')
        private readonly doctorRepository: IDoctorRepository,
    ) { }

    async execute(id: string): Promise<void> {
        return await this.doctorRepository.delete(id);
    }
}
