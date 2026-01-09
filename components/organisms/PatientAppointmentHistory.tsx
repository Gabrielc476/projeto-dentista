import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Appointment } from '@/types';
import { EmptyState } from '../molecules/EmptyState';

interface PatientAppointmentHistoryProps {
    appointments: Appointment[];
}

const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        scheduled: 'default',
        completed: 'secondary',
        cancelled: 'destructive',
        no_show: 'outline',
    };
    return variants[status] || 'outline';
};

const formatStatus = (status: string) => {
    const labels: Record<string, string> = {
        scheduled: 'Agendada',
        completed: 'Concluída',
        cancelled: 'Cancelada',
        no_show: 'Não Compareceu',
    };
    return labels[status] || status;
};

export function PatientAppointmentHistory({ appointments }: PatientAppointmentHistoryProps) {
    if (appointments.length === 0) {
        return (
            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Histórico de Consultas</h2>
                <EmptyState message="Nenhuma consulta registrada para este paciente." />
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Histórico de Consultas</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Procedimentos</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                            <TableCell>
                                {new Date(appointment.scheduledDate).toLocaleString('pt-BR')}
                            </TableCell>
                            <TableCell>
                                {appointment.procedimentos && appointment.procedimentos.length > 0
                                    ? appointment.procedimentos.map(p => p.name).join(', ')
                                    : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                                {appointment.totalValue
                                    ? `R$ ${appointment.totalValue.toFixed(2)}`
                                    : '-'}
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadge(appointment.status)}>
                                    {formatStatus(appointment.status)}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
