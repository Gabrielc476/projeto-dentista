import { Injectable, Inject } from '@nestjs/common';
import type { IDoctorRepository } from '../../../domain/repositories/doctor.repository.interface';
import { Doctor, WeekdayNumber, ShiftType } from '../../../domain/entities/doctor.entity';
import { UpdateDoctorDto } from '../../dtos/update-doctor.dto';

@Injectable()
export class UpdateDoctorUseCase {
    constructor(
        @Inject('IDoctorRepository')
        private readonly doctorRepository: IDoctorRepository,
    ) { }

    async execute(id: string, dto: UpdateDoctorDto): Promise<Doctor> {
        // Cast types to match entity definition
        const updateData: Partial<Doctor> = {
            ...dto,
            fixedWeekdays: dto.fixedWeekdays as WeekdayNumber[] | undefined,
            fixedShift: dto.fixedShift as ShiftType | undefined,
        };
        return await this.doctorRepository.update(id, updateData);
    }
}

