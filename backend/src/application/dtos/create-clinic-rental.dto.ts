import { IsString, IsNotEmpty, IsOptional, IsIn, IsDateString } from 'class-validator';

export class CreateClinicRentalDto {
    @IsString()
    @IsNotEmpty()
    doctorId: string;

    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsString()
    @IsIn(['morning', 'afternoon', 'evening'])
    shift: 'morning' | 'afternoon' | 'evening';

    @IsOptional()
    @IsString()
    notes?: string;
}
