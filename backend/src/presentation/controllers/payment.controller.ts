import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CreatePaymentUseCase } from '../../application/use-cases/payment/create-payment.usecase';
import { GetPaymentUseCase } from '../../application/use-cases/payment/get-payment.usecase';
import { ListPaymentsUseCase } from '../../application/use-cases/payment/list-payments.usecase';
import { ListPendingPaymentsUseCase } from '../../application/use-cases/payment/list-pending-payments.usecase';
import { UpdatePaymentUseCase } from '../../application/use-cases/payment/update-payment.usecase';
import { DeletePaymentUseCase } from '../../application/use-cases/payment/delete-payment.usecase';
import { CreatePaymentDto } from '../../application/dtos/input/create-payment.dto';
import { UpdatePaymentDto } from '../../application/dtos/input/update-payment.dto';

@Controller('api/payments')
export class PaymentController {
    constructor(
        private readonly createPaymentUseCase: CreatePaymentUseCase,
        private readonly getPaymentUseCase: GetPaymentUseCase,
        private readonly listPaymentsUseCase: ListPaymentsUseCase,
        private readonly listPendingPaymentsUseCase: ListPendingPaymentsUseCase,
        private readonly updatePaymentUseCase: UpdatePaymentUseCase,
        private readonly deletePaymentUseCase: DeletePaymentUseCase,
    ) { }

    @Post()
    async create(@Body() createPaymentDto: CreatePaymentDto) {
        return await this.createPaymentUseCase.execute(createPaymentDto);
    }

    @Get()
    async findAll(
        @Query('patientId') patientId?: string,
        @Query('appointmentId') appointmentId?: string,
        @Query('status') status?: string,
    ) {
        const filters = {
            patientId,
            appointmentId,
            status,
        };
        return await this.listPaymentsUseCase.execute(filters);
    }

    @Get('pending')
    async findPending() {
        return await this.listPendingPaymentsUseCase.execute();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.getPaymentUseCase.execute(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
        return await this.updatePaymentUseCase.execute(id, updatePaymentDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.deletePaymentUseCase.execute(id);
    }
}
