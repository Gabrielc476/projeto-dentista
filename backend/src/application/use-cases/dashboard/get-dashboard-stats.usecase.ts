import { Injectable, Inject } from '@nestjs/common';
import type { IDashboardRepository, DashboardStats } from '../../../domain/repositories/dashboard.repository.interface';

@Injectable()
export class GetDashboardStatsUseCase {
    constructor(
        @Inject('IDashboardRepository')
        private readonly dashboardRepository: IDashboardRepository,
    ) { }

    async execute(): Promise<DashboardStats> {
        return await this.dashboardRepository.getStats();
    }
}
