import { Injectable, Inject } from '@nestjs/common';
import type { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../../domain/entities/appointment.entity';

@Injectable()
export class ListAppointmentsUseCase {
    constructor(
        @Inject('IAppointmentRepository')
        private readonly appointmentRepository: IAppointmentRepository,
    ) { }

    async execute(filters?: { patientId?: string; status?: string; date?: string }): Promise<Appointment[]> {
        const parsedFilters = filters ? {
            ...filters,
            date: filters.date ? new Date(filters.date) : undefined,
        } : undefined;

        return await this.appointmentRepository.findAll(parsedFilters);
    }
}
