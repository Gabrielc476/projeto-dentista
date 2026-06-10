import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { IDashboardRepository, DashboardStats } from '../../../domain/repositories/dashboard.repository.interface';
import { SupabaseConfig } from '../supabase.config';

@Injectable()
export class SupabaseDashboardRepository implements IDashboardRepository {
    private supabase: SupabaseClient;
    private readonly logger = new Logger(SupabaseDashboardRepository.name);

    constructor() {
        this.supabase = SupabaseConfig.getInstance();
    }

    async getStats(): Promise<DashboardStats> {
        this.logger.log('Fetching dashboard statistics from Supabase...');
        const startTime = Date.now();

        try {
            // 1. Total Patients
            const { count: totalPatients, error: errPatients } = await this.supabase
                .from('patients')
                .select('*', { count: 'exact', head: true });

            if (errPatients) throw errPatients;

            // 2. Today's Appointments
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const { count: todayAppointments, error: errAppointments } = await this.supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .gte('scheduled_date', todayStart.toISOString())
                .lte('scheduled_date', todayEnd.toISOString())
                .neq('status', 'cancelled');

            if (errAppointments) throw errAppointments;

            // 3. Completed Procedures (Count of procedures linked to completed appointments)
            const { data: proceduresData, error: errProcedures } = await this.supabase
                .from('appointment_procedures')
                .select('appointment_id, appointments!inner(status)')
                .eq('appointments.status', 'completed');

            if (errProcedures) throw errProcedures;
            const completedProcedures = proceduresData?.length || 0;

            // 4. Pending Payments
            const { count: pendingPayments, error: errPayments } = await this.supabase
                .from('payments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            if (errPayments) throw errPayments;

            // 5. Monthly Revenue
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

            const { data: revenueData, error: errRevenue } = await this.supabase
                .from('payments')
                .select('amount')
                .eq('status', 'completed')
                .gte('payment_date', monthStart.toISOString())
                .lte('payment_date', monthEnd.toISOString());

            if (errRevenue) throw errRevenue;
            const monthlyRevenue = revenueData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

            const elapsed = Date.now() - startTime;
            this.logger.log(`Dashboard stats fetched successfully in ${elapsed}ms`);

            return {
                totalPatients: totalPatients || 0,
                todayAppointments: todayAppointments || 0,
                completedProcedures,
                pendingPayments: pendingPayments || 0,
                monthlyRevenue,
            };
        } catch (error) {
            this.logger.error('Error fetching dashboard stats from Supabase', error.stack);
            throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
        }
    }
}
