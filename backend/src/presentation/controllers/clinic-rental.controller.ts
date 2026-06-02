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
import { CreateClinicRentalUseCase } from '../../application/use-cases/clinic-rental/create-clinic-rental.usecase';
import { GetClinicRentalUseCase } from '../../application/use-cases/clinic-rental/get-clinic-rental.usecase';
import { ListClinicRentalsUseCase } from '../../application/use-cases/clinic-rental/list-clinic-rentals.usecase';
import { UpdateClinicRentalUseCase } from '../../application/use-cases/clinic-rental/update-clinic-rental.usecase';
import { DeleteClinicRentalUseCase } from '../../application/use-cases/clinic-rental/delete-clinic-rental.usecase';
import { CreateClinicRentalDto } from '../../application/dtos/create-clinic-rental.dto';
import { UpdateClinicRentalDto } from '../../application/dtos/update-clinic-rental.dto';

@Controller('api/clinic-rentals')
@UseGuards(JwtAuthGuard)
export class ClinicRentalController {
    private readonly logger = new Logger(ClinicRentalController.name);

    constructor(
        private readonly createClinicRentalUseCase: CreateClinicRentalUseCase,
        private readonly getClinicRentalUseCase: GetClinicRentalUseCase,
        private readonly listClinicRentalsUseCase: ListClinicRentalsUseCase,
        private readonly updateClinicRentalUseCase: UpdateClinicRentalUseCase,
        private readonly deleteClinicRentalUseCase: DeleteClinicRentalUseCase,
    ) { }

    @Post()
    async create(@Body() createClinicRentalDto: CreateClinicRentalDto) {
        this.logger.log(`POST /api/clinic-rentals - Creating new rental`);
        try {
            const result = await this.createClinicRentalUseCase.execute(createClinicRentalDto);
            this.logger.log(`POST /api/clinic-rentals - Rental created successfully with ID: ${result.id}`);
            return result;
        } catch (error) {
            this.logger.error(`POST /api/clinic-rentals - Error creating rental: ${error.message}`);
            throw error;
        }
    }

    @Get()
    async findAll(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('doctorId') doctorId?: string,
    ) {
        this.logger.log(`GET /api/clinic-rentals - Fetching rentals`);
        try {
            const result = await this.listClinicRentalsUseCase.execute(startDate, endDate, doctorId);
            this.logger.log(`GET /api/clinic-rentals - Found ${result.length} rentals`);
            return result;
        } catch (error) {
            this.logger.error('GET /api/clinic-rentals - Error fetching rentals', error.stack);
            throw error;
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.getClinicRentalUseCase.execute(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateClinicRentalDto: UpdateClinicRentalDto) {
        return await this.updateClinicRentalUseCase.execute(id, updateClinicRentalDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.deleteClinicRentalUseCase.execute(id);
    }
}
