import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';

export class UpdatePaymentDto {
    @IsOptional()
    @IsString()
    appointmentId?: string;

    @IsOptional()
    @IsString()
    patientId?: string;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsEnum(['cash', 'credit_card', 'debit_card', 'pix', 'insurance'])
    paymentType?: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'insurance';

    @IsOptional()
    @IsDateString()
    paymentDate?: string;

    @IsOptional()
    @IsEnum(['pending', 'completed', 'cancelled'])
    status?: 'pending' | 'completed' | 'cancelled';

    @IsOptional()
    @IsString()
    notes?: string;
}
