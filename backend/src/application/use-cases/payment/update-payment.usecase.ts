import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import type { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { Payment } from '../../../domain/entities/payment.entity';
import { UpdatePaymentDto } from '../../dtos/input/update-payment.dto';

@Injectable()
export class UpdatePaymentUseCase {
    constructor(
        @Inject('IPaymentRepository')
        private readonly paymentRepository: IPaymentRepository,
        @Inject('IAppointmentRepository')
        private readonly appointmentRepository: IAppointmentRepository,
    ) { }

    async execute(id: string, dto: UpdatePaymentDto): Promise<Payment> {
        const payment = await this.paymentRepository.findById(id);

        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }

        const updateData: Partial<Payment> = {
            ...dto,
            paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
        };

        const updatedPayment = await this.paymentRepository.update(id, updateData);

        // Sync payment status to appointment based on accumulated payments
        if (payment.appointmentId) {
            const appointment = await this.appointmentRepository.findById(payment.appointmentId);
            if (appointment) {
                const payments = await this.paymentRepository.findAll({ appointmentId: payment.appointmentId });
                const totalPaid = payments
                    .filter(p => p.status === 'completed')
                    .reduce((sum, p) => sum + Number(p.amount), 0);

                const paymentStatus = totalPaid >= (appointment.totalValue ?? 0) ? 'completed' : 'pending';
                await this.appointmentRepository.update(payment.appointmentId, {
                    paymentStatus,
                });
            }
        }

        return updatedPayment;
    }
}
