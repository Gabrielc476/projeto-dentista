import { Injectable, Inject } from '@nestjs/common';
import type { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { Payment } from '../../../domain/entities/payment.entity';

@Injectable()
export class ListPaymentsUseCase {
    constructor(
        @Inject('IPaymentRepository')
        private readonly paymentRepository: IPaymentRepository,
    ) { }

    async execute(filters?: { patientId?: string; appointmentId?: string; status?: string }): Promise<Payment[]> {
        return await this.paymentRepository.findAll(filters);
    }
}
