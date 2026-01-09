import { useState, useEffect } from 'react';
import { Appointment, Patient, Payment, Procedure } from '@/types';
import { appointmentService } from '@/features/appointments/services/appointment.service';
import { patientService } from '@/features/patients/services/patient.service';
import { paymentService } from '@/features/payments/services/payment.service';
import { procedureService } from '@/features/procedures/services/procedure.service';

export function useDashboard() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [procedures, setProcedures] = useState<Procedure[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [appointmentsData, patientsData, paymentsData, proceduresData] = await Promise.all([
                appointmentService.getAll(),
                patientService.getAll(),
                paymentService.getAll(),
                procedureService.getAll(),
            ]);

            setAppointments(appointmentsData);
            setPatients(patientsData);
            setPayments(paymentsData);
            setProcedures(proceduresData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate KPIs
    const totalPatients = patients.length;

    const todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.scheduledDate);
        const today = new Date();
        return aptDate.toDateString() === today.toDateString();
    }).length;

    const completedProcedures = appointments.filter(
        apt => apt.status === 'completed'
    ).reduce((sum, apt) => sum + (apt.procedimentos?.length || 0), 0);

    const pendingPayments = payments.filter(p => p.status === 'pending').length;

    const monthlyRevenue = payments
        .filter(p => {
            const pDate = new Date(p.paymentDate);
            const now = new Date();
            return p.status === 'completed' &&
                pDate.getMonth() === now.getMonth() &&
                pDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, p) => sum + p.amount, 0);

    // Get next appointment
    const upcomingAppointments = appointments
        .filter(apt => new Date(apt.scheduledDate) > new Date() && apt.status === 'scheduled')
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

    const nextAppointment = upcomingAppointments[0] || null;
    const upcomingList = upcomingAppointments.slice(0, 5); // Next 5 appointments

    return {
        loading,
        kpis: {
            totalPatients,
            todayAppointments,
            completedProcedures,
            pendingPayments,
            monthlyRevenue,
        },
        nextAppointment,
        upcomingAppointments: upcomingList,
    };
}
