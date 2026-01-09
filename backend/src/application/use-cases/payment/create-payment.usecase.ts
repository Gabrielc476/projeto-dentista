import { Injectable, Inject } from '@nestjs/common';
import type { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import type { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { Payment } from '../../../domain/entities/payment.entity';
import { CreatePaymentDto } from '../../dtos/input/create-payment.dto';

@Injectable()
export class CreatePaymentUseCase {
    constructor(
        @Inject('IPaymentRepository')
        private readonly paymentRepository: IPaymentRepository,
        @Inject('IAppointmentRepository')
        private readonly appointmentRepository: IAppointmentRepository,
    ) { }

    async execute(dto: CreatePaymentDto): Promise<Payment> {
        const paymentData = {
            appointmentId: dto.appointmentId,
            patientId: dto.patientId,
            amount: dto.amount,
            paymentType: dto.paymentType,
            paymentDate: new Date(dto.paymentDate),
            status: dto.status,
            notes: dto.notes,
        };

        const payment = await this.paymentRepository.create(paymentData);

        // Sync payment status to appointment
        if (dto.appointmentId) {
            const paymentStatus = dto.status === 'completed' ? 'completed' : 'pending';
            await this.appointmentRepository.update(dto.appointmentId, {
                paymentStatus,
            });
        }

        return payment;
    }
}
