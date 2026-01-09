import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { Payment } from '../../../domain/entities/payment.entity';
import { UpdatePaymentDto } from '../../dtos/input/update-payment.dto';

@Injectable()
export class UpdatePaymentUseCase {
    constructor(
        @Inject('IPaymentRepository')
        private readonly paymentRepository: IPaymentRepository,
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

        return await this.paymentRepository.update(id, updateData);
    }
}
