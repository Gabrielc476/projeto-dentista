import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    HttpCode,
    HttpStatus,
    Logger,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreatePatientUseCase } from '../../application/use-cases/patient/create-patient.usecase';
import { GetPatientUseCase } from '../../application/use-cases/patient/get-patient.usecase';
import { ListPatientsUseCase } from '../../application/use-cases/patient/list-patients.usecase';
import { UpdatePatientUseCase } from '../../application/use-cases/patient/update-patient.usecase';
import { DeletePatientUseCase } from '../../application/use-cases/patient/delete-patient.usecase';
import { CreatePatientDto } from '../../application/dtos/input/create-patient.dto';
import { UpdatePatientDto } from '../../application/dtos/input/update-patient.dto';

@Controller('api/patients')
@UseGuards(JwtAuthGuard)
export class PatientController {
    private readonly logger = new Logger(PatientController.name);

    constructor(
        private readonly createPatientUseCase: CreatePatientUseCase,
        private readonly getPatientUseCase: GetPatientUseCase,
        private readonly listPatientsUseCase: ListPatientsUseCase,
        private readonly updatePatientUseCase: UpdatePatientUseCase,
        private readonly deletePatientUseCase: DeletePatientUseCase,
    ) { }

    @Post()
    async create(@Body() createPatientDto: CreatePatientDto) {
        this.logger.log(`POST /api/patients - Creating new patient`);
        this.logger.log(`Request body: ${JSON.stringify(createPatientDto, null, 2)}`);
        try {
            const result = await this.createPatientUseCase.execute(createPatientDto);
            this.logger.log(`POST /api/patients - Patient created successfully with ID: ${result.id}`);
            return result;
        } catch (error) {
            this.logger.error(`POST /api/patients - Error creating patient: ${error.message}`);
            this.logger.error(`Error stack: ${error.stack}`);
            this.logger.error(`Error details: ${JSON.stringify(error, null, 2)}`);
            throw error;
        }
    }

    @Get()
    async findAll() {
        this.logger.log('GET /api/patients - Fetching all patients');
        try {
            const result = await this.listPatientsUseCase.execute();
            this.logger.log(`GET /api/patients - Found ${result.length} patients`);
            return result;
        } catch (error) {
            this.logger.error('GET /api/patients - Error fetching patients', error.stack);
            throw error;
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.getPatientUseCase.execute(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
        return await this.updatePatientUseCase.execute(id, updatePatientDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.deletePatientUseCase.execute(id);
    }
}
