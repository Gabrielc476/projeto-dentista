import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';

export class UpdateClinicRentalDto {
    @IsOptional()
    @IsString()
    doctorId?: string;

    @IsOptional()
    @IsDateString()
    date?: string;

    @IsOptional()
    @IsString()
    @IsIn(['morning', 'afternoon', 'evening'])
    shift?: 'morning' | 'afternoon' | 'evening';

    @IsOptional()
    @IsString()
    notes?: string;
}
