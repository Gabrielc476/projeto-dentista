import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { UpdateAppointmentDto } from '../../dtos/input/update-appointment.dto';

@Injectable()
export class UpdateAppointmentUseCase {
    constructor(
        @Inject('IAppointmentRepository')
        private readonly appointmentRepository: IAppointmentRepository,
    ) { }

    async execute(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
        const appointment = await this.appointmentRepository.findById(id);

        if (!appointment) {
            throw new NotFoundException(`Appointment with ID ${id} not found`);
        }

        const updateData: Partial<Appointment> = {
            ...dto,
            scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        };

        return await this.appointmentRepository.update(id, updateData);
    }
}
