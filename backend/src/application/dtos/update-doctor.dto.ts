import { IsString, IsOptional, IsIn, IsArray, IsNumber } from 'class-validator';

export class UpdateDoctorDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    @IsIn(['fixed', 'temporary'])
    type?: 'fixed' | 'temporary';

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    fixedWeekdays?: number[];

    @IsOptional()
    @IsString()
    @IsIn(['morning', 'afternoon', 'evening'])
    fixedShift?: 'morning' | 'afternoon' | 'evening';
}

