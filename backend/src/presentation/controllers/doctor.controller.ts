import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    Logger,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateDoctorUseCase } from '../../application/use-cases/doctor/create-doctor.usecase';
import { GetDoctorUseCase } from '../../application/use-cases/doctor/get-doctor.usecase';
import { ListDoctorsUseCase } from '../../application/use-cases/doctor/list-doctors.usecase';
import { UpdateDoctorUseCase } from '../../application/use-cases/doctor/update-doctor.usecase';
import { DeleteDoctorUseCase } from '../../application/use-cases/doctor/delete-doctor.usecase';
import { CreateDoctorDto } from '../../application/dtos/create-doctor.dto';
import { UpdateDoctorDto } from '../../application/dtos/update-doctor.dto';

@Controller('api/doctors')
@UseGuards(JwtAuthGuard)
export class DoctorController {
    private readonly logger = new Logger(DoctorController.name);

    constructor(
        private readonly createDoctorUseCase: CreateDoctorUseCase,
        private readonly getDoctorUseCase: GetDoctorUseCase,
        private readonly listDoctorsUseCase: ListDoctorsUseCase,
        private readonly updateDoctorUseCase: UpdateDoctorUseCase,
        private readonly deleteDoctorUseCase: DeleteDoctorUseCase,
    ) { }

    @Post()
    async create(@Body() createDoctorDto: CreateDoctorDto) {
        this.logger.log(`POST /api/doctors - Creating new doctor`);
        try {
            const result = await this.createDoctorUseCase.execute(createDoctorDto);
            this.logger.log(`POST /api/doctors - Doctor created successfully with ID: ${result.id}`);
            return result;
        } catch (error) {
            this.logger.error(`POST /api/doctors - Error creating doctor: ${error.message}`);
            throw error;
        }
    }

    @Get()
    async findAll(@Query('type') type?: 'fixed' | 'temporary') {
        this.logger.log(`GET /api/doctors - Fetching doctors${type ? ` of type: ${type}` : ''}`);
        try {
            const result = await this.listDoctorsUseCase.execute(type);
            this.logger.log(`GET /api/doctors - Found ${result.length} doctors`);
            return result;
        } catch (error) {
            this.logger.error('GET /api/doctors - Error fetching doctors', error.stack);
            throw error;
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.getDoctorUseCase.execute(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
        return await this.updateDoctorUseCase.execute(id, updateDoctorDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.deleteDoctorUseCase.execute(id);
    }
}
