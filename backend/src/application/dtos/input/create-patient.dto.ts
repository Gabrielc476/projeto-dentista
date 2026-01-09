import { IsString, IsEmail, IsOptional, IsDateString, IsPhoneNumber } from 'class-validator';

export class CreatePatientDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    cpf?: string;

    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
