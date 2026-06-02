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
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateAppointmentUseCase } from '../../application/use-cases/appointment/create-appointment.usecase';
import { GetAppointmentUseCase } from '../../application/use-cases/appointment/get-appointment.usecase';
import { ListAppointmentsUseCase } from '../../application/use-cases/appointment/list-appointments.usecase';
import { UpdateAppointmentUseCase } from '../../application/use-cases/appointment/update-appointment.usecase';
import { DeleteAppointmentUseCase } from '../../application/use-cases/appointment/delete-appointment.usecase';
import { CreateAppointmentDto } from '../../application/dtos/input/create-appointment.dto';
import { UpdateAppointmentDto } from '../../application/dtos/input/update-appointment.dto';

@Controller('api/appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
    constructor(
        private readonly createAppointmentUseCase: CreateAppointmentUseCase,
        private readonly getAppointmentUseCase: GetAppointmentUseCase,
        private readonly listAppointmentsUseCase: ListAppointmentsUseCase,
        private readonly updateAppointmentUseCase: UpdateAppointmentUseCase,
        private readonly deleteAppointmentUseCase: DeleteAppointmentUseCase,
    ) { }

    @Post()
    async create(@Body() createAppointmentDto: CreateAppointmentDto) {
        return await this.createAppointmentUseCase.execute(createAppointmentDto);
    }

    @Get()
    async findAll(
        @Query('patientId') patientId?: string,
        @Query('status') status?: string,
        @Query('date') date?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const filters = {
            patientId,
            status,
            date,
            startDate,
            endDate,
        };
        return await this.listAppointmentsUseCase.execute(filters);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.getAppointmentUseCase.execute(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
        return await this.updateAppointmentUseCase.execute(id, updateAppointmentDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.deleteAppointmentUseCase.execute(id);
    }
}
