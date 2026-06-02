import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/types';
import { Calendar, Clock, User } from 'lucide-react';

interface NextAppointmentCardProps {
    appointment: Appointment | null;
    onViewDetails?: () => void;
}

export function NextAppointmentCard({ appointment, onViewDetails }: NextAppointmentCardProps) {
    if (!appointment) {
        return (
            <Card className="p-8 text-center">
                <p className="text-muted-foreground">Nenhuma consulta agendada</p>
            </Card>
        );
    }

    const appointmentDate = new Date(appointment.scheduledDate);
    const timeString = appointmentDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const dateString = appointmentDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
    });

    return (
        <Card className="overflow-hidden">
            {/* Gradient Header */}
            <div className="gradient-card p-6 text-white">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm opacity-90 mb-1">Próxima Consulta</p>
                        <h3 className="text-2xl font-bold mb-4">
                            {appointment.pacienteNome || 'Paciente'}
                        </h3>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span className="capitalize">{dateString}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>{timeString}</span>
                            </div>
                        </div>
                    </div>

                    {/* Avatar Circle */}
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div className="p-6 space-y-4">
                {appointment.procedimentos && appointment.procedimentos.length > 0 && (
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Procedimentos</p>
                        <div className="flex flex-wrap gap-2">
                            {appointment.procedimentos.map((proc, index) => (
                                <Badge key={index} variant="secondary">
                                    {proc.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {appointment.totalValue && (
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
                        <p className="text-2xl font-bold text-primary">
                            R$ {appointment.totalValue.toFixed(2)}
                        </p>
                    </div>
                )}

                <div className="flex gap-2 pt-2">
                    <Button onClick={onViewDetails} className="flex-1">
                        Ver Detalhes
                    </Button>
                    <Button variant="outline" className="flex-1">
                        Finalizar Atendimento
                    </Button>
                </div>
            </div>
        </Card>
    );
}
