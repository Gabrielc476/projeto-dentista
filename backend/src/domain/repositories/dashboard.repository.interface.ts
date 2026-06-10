export interface DashboardStats {
    totalPatients: number;
    todayAppointments: number;
    completedProcedures: number;
    pendingPayments: number;
    monthlyRevenue: number;
}

export interface IDashboardRepository {
    getStats(): Promise<DashboardStats>;
}
