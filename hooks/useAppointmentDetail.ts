import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Appointment, Patient, Payment } from '@/types';
import { appointmentService } from '@/features/appointments/services/appointment.service';
import { patientService } from '@/features/patients/services/patient.service';
import { paymentService } from '@/features/payments/services/payment.service';

export function useAppointmentDetail(appointmentId: string) {
    const router = useRouter();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointmentData();
    }, [appointmentId]);

    const loadAppointmentData = async () => {
        try {
            const appointmentData = await appointmentService.getById(appointmentId);
            setAppointment(appointmentData);

            // Load related patient
            if (appointmentData.patientId) {
                const patientData = await patientService.getById(appointmentData.patientId);
                setPatient(patientData);
            }

            // Load related payments
            const allPayments = await paymentService.getAll();
            const appointmentPayments = allPayments.filter(
                pmt => pmt.appointmentId === appointmentId
            );
            setPayments(appointmentPayments);
        } catch (error) {
            console.error('Error loading appointment data:', error);
            alert('Erro ao carregar dados da consulta');
        } finally {
            setLoading(false);
        }
    };

    const navigateBack = () => {
        router.push('/consultas');
    };

    return {
        appointment,
        patient,
        payments,
        loading,
        navigateBack,
    };
}
