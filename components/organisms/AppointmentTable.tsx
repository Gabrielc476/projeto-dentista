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
    onStatusChange?: (id: string, status: string) => void;
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

const getPaymentStatusBadge = (paymentStatus?: string) => {
    if (!paymentStatus || paymentStatus === 'pending') {
        return (
            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                💰 Pendente
            </Badge>
        );
    }
    if (paymentStatus === 'completed' || paymentStatus === 'paid') {
        return (
            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                ✅ Pago
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
            {paymentStatus}
        </Badge>
    );
};

export function AppointmentTable({ appointments, loading, onEdit, onDelete, onStatusChange }: AppointmentTableProps) {
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

    const handleStatusChange = (id: string, newStatus: string) => {
        if (onStatusChange) {
            onStatusChange(id, newStatus);
        }
    };

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
                        <TableHead>Pagamento</TableHead>
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
                            <TableCell>
                                {getPaymentStatusBadge(appointment.paymentStatus)}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1 flex-wrap">
                                    {/* Status Change Buttons */}
                                    {appointment.status === 'scheduled' && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-green-600 border-green-200 hover:bg-green-50"
                                                onClick={() => handleStatusChange(appointment.id, 'completed')}
                                            >
                                                ✓ Concluir
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                            >
                                                ✕ Cancelar
                                            </Button>
                                        </>
                                    )}
                                    {appointment.status === 'completed' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                            onClick={() => handleStatusChange(appointment.id, 'scheduled')}
                                        >
                                            ↩ Reagendar
                                        </Button>
                                    )}
                                    {appointment.status === 'cancelled' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                            onClick={() => handleStatusChange(appointment.id, 'scheduled')}
                                        >
                                            ↩ Reativar
                                        </Button>
                                    )}

                                    {/* Existing action buttons */}
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
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
