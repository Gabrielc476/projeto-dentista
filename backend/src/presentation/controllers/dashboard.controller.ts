import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetDashboardStatsUseCase } from '../../application/use-cases/dashboard/get-dashboard-stats.usecase';

@Controller('api/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    private readonly logger = new Logger(DashboardController.name);

    constructor(
        private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    ) { }

    @Get('stats')
    async getStats() {
        this.logger.log('GET /api/dashboard/stats - Fetching stats');
        try {
            return await this.getDashboardStatsUseCase.execute();
        } catch (error) {
            this.logger.error(`GET /api/dashboard/stats - Error: ${error.message}`);
            throw error;
        }
    }
}
