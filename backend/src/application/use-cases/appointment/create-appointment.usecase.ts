import { Injectable, Inject } from '@nestjs/common';
import type { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import type { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { CreateAppointmentDto } from '../../dtos/input/create-appointment.dto';

@Injectable()
export class CreateAppointmentUseCase {
    constructor(
        @Inject('IAppointmentRepository')
        private readonly appointmentRepository: IAppointmentRepository,
        @Inject('IPaymentRepository')
        private readonly paymentRepository: IPaymentRepository,
    ) { }

    async execute(dto: CreateAppointmentDto): Promise<Appointment> {
        const appointmentData = {
            patientId: dto.patientId,
            scheduledDate: new Date(dto.scheduledDate),
            status: dto.status,
            paymentStatus: 'pending' as const,
            notes: dto.notes,
            totalValue: dto.totalValue,
        };

        const procedures = dto.procedures.map(p => ({
            id: p.id,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
        }));

        const appointment = await this.appointmentRepository.create(appointmentData, procedures);

        // Auto-create pending payment for the appointment
        if (appointment.totalValue && appointment.totalValue > 0) {
            await this.paymentRepository.create({
                appointmentId: appointment.id,
                patientId: appointment.patientId,
                amount: appointment.totalValue,
                paymentType: 'cash', // Default, can be changed later
                paymentDate: new Date(),
                status: 'pending',
                notes: 'Pagamento automático criado com a consulta',
            });
        }

        return appointment;
    }
}
