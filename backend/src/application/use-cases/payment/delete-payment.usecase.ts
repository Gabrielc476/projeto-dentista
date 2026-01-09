import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';

@Injectable()
export class DeletePaymentUseCase {
    constructor(
        @Inject('IPaymentRepository')
        private readonly paymentRepository: IPaymentRepository,
    ) { }

    async execute(id: string): Promise<void> {
        const payment = await this.paymentRepository.findById(id);

        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }

        await this.paymentRepository.delete(id);
    }
}
