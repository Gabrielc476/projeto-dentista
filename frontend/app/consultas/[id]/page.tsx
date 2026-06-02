'use client';

import { use } from 'react';
import { useAppointmentDetail } from '@/hooks/useAppointmentDetail';
import { Button } from '@/components/ui/button';
import { AppointmentInfoCard } from '@/components/molecules/AppointmentInfoCard';
import { AppointmentPaymentInfo } from '@/components/organisms/AppointmentPaymentInfo';
import { LoadingState } from '@/components/molecules/LoadingState';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AppointmentDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function AppointmentDetailPage({ params }: AppointmentDetailPageProps) {
    const { id } = use(params);
    const { appointment, patient, payments, loading, navigateBack } = useAppointmentDetail(id);

    if (loading) {
        return (
            <div className="space-y-6">
                <LoadingState />
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="space-y-6">
                <Button variant="outline" onClick={navigateBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
                <p className="text-center text-gray-500">Consulta não encontrada.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={navigateBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Consulta - {appointment.pacienteNome || 'Paciente'}
                        </h1>
                        <p className="text-gray-600">Detalhes da consulta</p>
                    </div>
                </div>
                {patient && (
                    <Link href={`/pacientes/${patient.id}`}>
                        <Button variant="secondary">
                            Ver Paciente
                        </Button>
                    </Link>
                )}
            </div>

            {/* Appointment Information */}
            <AppointmentInfoCard
                appointment={appointment}
                patientName={patient?.name}
            />

            {/* Payment Information */}
            <AppointmentPaymentInfo
                payments={payments}
                totalValue={appointment.totalValue || 0}
            />
        </div>
    );
}
