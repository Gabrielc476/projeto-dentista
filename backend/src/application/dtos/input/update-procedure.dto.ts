import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateProcedureDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    defaultPrice?: number;

    @IsOptional()
    @IsNumber()
    durationMinutes?: number;
}
