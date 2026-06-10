import { useState, useEffect } from 'react';
import { Appointment } from '@/types';
import { appointmentService } from '@/features/appointments/services/appointment.service';
import { api } from '@/lib/api';

export interface DashboardKpis {
    totalPatients: number;
    todayAppointments: number;
    completedProcedures: number;
    pendingPayments: number;
    monthlyRevenue: number;
}

export function useDashboard() {
    const [kpis, setKpis] = useState<DashboardKpis>({
        totalPatients: 0,
        todayAppointments: 0,
        completedProcedures: 0,
        pendingPayments: 0,
        monthlyRevenue: 0,
    });
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            // Busca apenas os dados estatísticos consolidados e as consultas agendadas ativas
            const [stats, appointmentsData] = await Promise.all([
                api.get<DashboardKpis>('/api/dashboard/stats'),
                appointmentService.getAll({ status: 'scheduled' }),
            ]);

            setKpis(stats);

            // Filtra e ordena apenas as consultas futuras no cliente (com base no subconjunto de agendadas)
            const now = new Date();
            const sortedUpcoming = appointmentsData
                .filter(apt => new Date(apt.scheduledDate) > now)
                .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

            setUpcomingAppointments(sortedUpcoming);
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextAppointment = upcomingAppointments[0] || null;
    const upcomingList = upcomingAppointments.slice(0, 5);

    return {
        loading,
        kpis,
        nextAppointment,
        upcomingAppointments: upcomingList,
        refetch: loadDashboardData,
    };
}
