import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';

@Injectable()
export class DeleteAppointmentUseCase {
    constructor(
        @Inject('IAppointmentRepository')
        private readonly appointmentRepository: IAppointmentRepository,
    ) { }

    async execute(id: string): Promise<void> {
        const appointment = await this.appointmentRepository.findById(id);

        if (!appointment) {
            throw new NotFoundException(`Appointment with ID ${id} not found`);
        }

        await this.appointmentRepository.delete(id);
    }
}
