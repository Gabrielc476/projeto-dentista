import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';

export class UpdateAppointmentDto {
    @IsOptional()
    @IsString()
    patientId?: string;

    @IsOptional()
    @IsDateString()
    scheduledDate?: string;

    @IsOptional()
    @IsEnum(['scheduled', 'completed', 'cancelled', 'no_show'])
    status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsNumber()
    totalValue?: number;
}
