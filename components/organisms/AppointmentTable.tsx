import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Appointment } from '@/types';
import { EmptyState } from '../molecules/EmptyState';
import { LoadingState } from '../molecules/LoadingState';
import { useRouter } from 'next/navigation';

interface AppointmentTableProps {
    appointments: Appointment[];
    loading: boolean;
    onEdit: (appointment: Appointment) => void;
    onDelete: (id: string) => void;
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

export function AppointmentTable({ appointments, loading, onEdit, onDelete }: AppointmentTableProps) {
    const router = useRouter();

    if (loading) {
        return (
            <Card className="p-6">
                <LoadingState />
            </Card>
        );
    }

    if (appointments.length === 0) {
        return (
            <Card className="p-6">
                <EmptyState message='Nenhuma consulta cadastrada. Clique em "+ Nova Consulta" para começar.' />
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Procedimentos</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                            <TableCell className="font-medium">
                                {appointment.pacienteNome || '-'}
                            </TableCell>
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
                            <TableCell className="text-right space-x-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => router.push(`/consultas/${appointment.id}`)}
                                >
                                    Detalhes
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(appointment)}
                                >
                                    Editar
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onDelete(appointment.id)}
                                >
                                    Deletar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
