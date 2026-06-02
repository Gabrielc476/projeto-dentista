'use client';

import { use } from 'react';
import { usePatientDetail } from '@/hooks/usePatientDetail';
import { Button } from '@/components/ui/button';
import { PatientInfoCard } from '@/components/molecules/PatientInfoCard';
import { PatientAppointmentHistory } from '@/components/organisms/PatientAppointmentHistory';
import { PatientPaymentHistory } from '@/components/organisms/PatientPaymentHistory';
import { LoadingState } from '@/components/molecules/LoadingState';
import { ArrowLeft } from 'lucide-react';

interface PatientDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
    const { id } = use(params);
    const { patient, appointments, payments, loading, navigateBack } = usePatientDetail(id);

    if (loading) {
        return (
            <div className="space-y-6">
                <LoadingState />
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="space-y-6">
                <Button variant="outline" onClick={navigateBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
                <p className="text-center text-gray-500">Paciente não encontrado.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={navigateBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
                    <p className="text-gray-600">Detalhes do paciente</p>
                </div>
            </div>

            {/* Patient Information */}
            <PatientInfoCard patient={patient} />

            {/* Appointment History */}
            <PatientAppointmentHistory appointments={appointments} />

            {/* Payment History */}
            <PatientPaymentHistory payments={payments} />
        </div>
    );
}
