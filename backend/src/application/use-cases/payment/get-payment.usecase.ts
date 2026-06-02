import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { Payment } from '../../../domain/entities/payment.entity';

@Injectable()
export class GetPaymentUseCase {
    constructor(
        @Inject('IPaymentRepository')
        private readonly paymentRepository: IPaymentRepository,
    ) { }

    async execute(id: string): Promise<Payment> {
        const payment = await this.paymentRepository.findById(id);

        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }

        return payment;
    }
}
