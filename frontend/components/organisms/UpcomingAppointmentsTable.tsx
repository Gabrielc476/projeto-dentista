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

interface UpcomingAppointmentsTableProps {
    appointments: Appointment[];
}

const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

export function UpcomingAppointmentsTable({ appointments }: UpcomingAppointmentsTableProps) {
    if (appointments.length === 0) {
        return (
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Próximas Consultas</h3>
                <EmptyState message="Nenhuma consulta agendada" />
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Próximas Consultas</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Procedimento</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {appointments.map((appointment) => {
                        const date = new Date(appointment.scheduledDate);
                        return (
                            <TableRow key={appointment.id}>
                                <TableCell>
                                    <Badge variant="outline">{formatDate(date)}</Badge>
                                </TableCell>
                                <TableCell className="font-medium">{formatTime(date)}</TableCell>
                                <TableCell>{appointment.pacienteNome || '-'}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {appointment.procedimentos && appointment.procedimentos.length > 0
                                        ? appointment.procedimentos[0].name
                                        : '-'}
                                    {appointment.procedimentos && appointment.procedimentos.length > 1 && (
                                        <span className="ml-1 text-xs">
                                            +{appointment.procedimentos.length - 1}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {appointment.totalValue
                                        ? `R$ ${appointment.totalValue.toFixed(2)}`
                                        : '-'}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Card>
    );
}
