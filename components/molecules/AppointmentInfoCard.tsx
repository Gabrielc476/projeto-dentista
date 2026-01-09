import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/types';

interface AppointmentInfoCardProps {
    appointment: Appointment;
    patientName?: string;
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

export function AppointmentInfoCard({ appointment, patientName }: AppointmentInfoCardProps) {
    return (
        <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Informações da Consulta</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-500">Paciente</p>
                    <p className="font-medium">{patientName || appointment.pacienteNome || '-'}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Data e Hora</p>
                    <p className="font-medium">
                        {new Date(appointment.scheduledDate).toLocaleString('pt-BR')}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant={getStatusBadge(appointment.status)}>
                        {formatStatus(appointment.status)}
                    </Badge>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Valor Total</p>
                    <p className="font-medium text-lg">
                        {appointment.totalValue
                            ? `R$ ${appointment.totalValue.toFixed(2)}`
                            : '-'}
                    </p>
                </div>

                {appointment.procedimentos && appointment.procedimentos.length > 0 && (
                    <div className="md:col-span-2">
                        <p className="text-sm text-gray-500 mb-2">Procedimentos Realizados</p>
                        <div className="space-y-2">
                            {appointment.procedimentos.map((proc, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                    <div>
                                        <p className="font-medium">{proc.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">
                                            Qtd: {proc.quantity || 1}
                                        </p>
                                        {proc.unitPrice && (
                                            <p className="font-medium">
                                                R$ {(proc.unitPrice * (proc.quantity || 1)).toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {appointment.notes && (
                    <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Observações</p>
                        <p className="font-medium">{appointment.notes}</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
