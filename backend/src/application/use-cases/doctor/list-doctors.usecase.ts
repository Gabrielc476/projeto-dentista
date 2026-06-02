import { Injectable, Inject } from '@nestjs/common';
import type { IDoctorRepository } from '../../../domain/repositories/doctor.repository.interface';
import { Doctor } from '../../../domain/entities/doctor.entity';

@Injectable()
export class ListDoctorsUseCase {
    constructor(
        @Inject('IDoctorRepository')
        private readonly doctorRepository: IDoctorRepository,
    ) { }

    async execute(type?: 'fixed' | 'temporary'): Promise<Doctor[]> {
        if (type) {
            return await this.doctorRepository.findByType(type);
        }
        return await this.doctorRepository.findAll();
    }
}
