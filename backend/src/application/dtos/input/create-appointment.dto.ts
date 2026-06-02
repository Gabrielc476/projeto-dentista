import { IsString, IsDateString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class ProcedureItemDto {
    @IsString()
    id: string;

    @IsNumber()
    quantity: number;

    @IsOptional()
    @IsNumber()
    unitPrice?: number;
}

export class CreateAppointmentDto {
    @IsString()
    patientId: string;

    @IsDateString()
    scheduledDate: string;

    @IsEnum(['scheduled', 'completed', 'cancelled', 'no_show'])
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsNumber()
    totalValue?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProcedureItemDto)
    procedures: ProcedureItemDto[];
}
