import { Injectable, Inject } from '@nestjs/common';
import type { IDoctorRepository } from '../../../domain/repositories/doctor.repository.interface';
import { Doctor } from '../../../domain/entities/doctor.entity';

@Injectable()
export class GetDoctorUseCase {
    constructor(
        @Inject('IDoctorRepository')
        private readonly doctorRepository: IDoctorRepository,
    ) { }

    async execute(id: string): Promise<Doctor | null> {
        return await this.doctorRepository.findById(id);
    }
}
