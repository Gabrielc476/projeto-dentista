import { IsString, IsNumber, IsDateString, IsEnum, IsOptional } from 'class-validator';

export class CreatePaymentDto {
    @IsString()
    appointmentId: string;

    @IsString()
    patientId: string;

    @IsNumber()
    amount: number;

    @IsEnum(['cash', 'credit_card', 'debit_card', 'pix', 'insurance'])
    paymentType: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'insurance';

    @IsDateString()
    paymentDate: string;

    @IsEnum(['pending', 'completed', 'cancelled'])
    status: 'pending' | 'completed' | 'cancelled';

    @IsOptional()
    @IsString()
    notes?: string;
}
