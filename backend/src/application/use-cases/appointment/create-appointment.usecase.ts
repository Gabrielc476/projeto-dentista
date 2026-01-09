import { Injectable, Inject } from '@nestjs/common';
import type { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { CreateAppointmentDto } from '../../dtos/input/create-appointment.dto';

@Injectable()
export class CreateAppointmentUseCase {
    constructor(
        @Inject('IAppointmentRepository')
        private readonly appointmentRepository: IAppointmentRepository,
    ) { }

    async execute(dto: CreateAppointmentDto): Promise<Appointment> {
        const appointmentData = {
            patientId: dto.patientId,
            scheduledDate: new Date(dto.scheduledDate),
            status: dto.status,
            notes: dto.notes,
            totalValue: dto.totalValue,
        };

        const procedures = dto.procedures.map(p => ({
            id: p.id,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
        }));

        return await this.appointmentRepository.create(appointmentData, procedures);
    }
}
