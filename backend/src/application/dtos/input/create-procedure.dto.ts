import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProcedureDto {
    @IsString()
    name: string;

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
