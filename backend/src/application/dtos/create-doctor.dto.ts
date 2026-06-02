import { IsString, IsNotEmpty, IsOptional, IsIn, IsArray, IsNumber } from 'class-validator';

export class CreateDoctorDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsIn(['fixed', 'temporary'])
    type: 'fixed' | 'temporary';

    @IsOptional()
    @IsString()
    notes?: string;

    // For fixed doctors: which days of the week they rent (0=Sunday, 1=Monday, etc.)
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    fixedWeekdays?: number[];

    // For fixed doctors: which shift they always rent
    @IsOptional()
    @IsString()
    @IsIn(['morning', 'afternoon', 'evening'])
    fixedShift?: 'morning' | 'afternoon' | 'evening';
}

