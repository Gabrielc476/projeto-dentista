import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Patient, Appointment, Payment } from '@/types';
import { patientService } from '@/features/patients/services/patient.service';
import { appointmentService } from '@/features/appointments/services/appointment.service';
import { paymentService } from '@/features/payments/services/payment.service';

export function usePatientDetail(patientId: string) {
    const router = useRouter();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPatientData();
    }, [patientId]);

    const loadPatientData = async () => {
        try {
            const [patientData, allAppointments, allPayments] = await Promise.all([
                patientService.getById(patientId),
                appointmentService.getAll(),
                paymentService.getAll(),
            ]);

            setPatient(patientData);

            // Filter appointments for this patient
            const patientAppointments = allAppointments.filter(
                apt => apt.patientId === patientId
            );
            setAppointments(patientAppointments);

            // Filter payments for this patient
            const patientPayments = allPayments.filter(
                pmt => pmt.patientId === patientId
            );
            setPayments(patientPayments);
        } catch (error) {
            console.error('Error loading patient data:', error);
            alert('Erro ao carregar dados do paciente');
        } finally {
            setLoading(false);
        }
    };

    const navigateBack = () => {
        router.push('/pacientes');
    };

    return {
        patient,
        appointments,
        payments,
        loading,
        navigateBack,
    };
}
