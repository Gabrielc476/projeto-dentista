import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/types';
import { useRouter } from 'next/navigation';

interface CalendarGridProps {
    days: Array<{
        date: Date;
        isCurrentMonth: boolean;
        appointments: Appointment[];
    }>;
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CalendarGrid({ days }: CalendarGridProps) {
    const router = useRouter();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = (date: Date) => {
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate.getTime() === today.getTime();
    };

    return (
        <Card className="p-6">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDays.map(day => (
                    <div key={day} className="text-center font-semibold text-muted-foreground py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar days grid */}
            <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                    const isTodayDate = isToday(day.date);
                    const hasAppointments = day.appointments.length > 0;

                    return (
                        <div
                            key={index}
                            className={`
                min-h-[100px] p-2 rounded-lg border transition-all
                ${day.isCurrentMonth
                                    ? 'bg-white border-border hover:border-primary hover:shadow-md cursor-pointer'
                                    : 'bg-muted/30 border-transparent'}
                ${isTodayDate ? 'ring-2 ring-primary' : ''}
              `}
                            onClick={() => {
                                if (hasAppointments && day.appointments[0]) {
                                    router.push(`/consultas/${day.appointments[0].id}`);
                                }
                            }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`
                  text-sm font-medium
                  ${!day.isCurrentMonth ? 'text-muted-foreground' : 'text-foreground'}
                  ${isTodayDate ? 'text-primary font-bold' : ''}
                `}>
                                    {day.date.getDate()}
                                </span>

                                {hasAppointments && (
                                    <Badge
                                        variant="secondary"
                                        className="h-5 px-1.5 text-xs bg-primary text-white"
                                    >
                                        {day.appointments.length}
                                    </Badge>
                                )}
                            </div>

                            {/* Appointment indicators */}
                            {hasAppointments && (
                                <div className="space-y-1">
                                    {day.appointments.slice(0, 3).map((apt, i) => (
                                        <div
                                            key={i}
                                            className="text-xs p-1 bg-primary/10 text-primary rounded truncate"
                                            title={`${apt.pacienteNome} - ${new Date(apt.scheduledDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                                        >
                                            {new Date(apt.scheduledDate).toLocaleTimeString('pt-BR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })} {apt.pacienteNome}
                                        </div>
                                    ))}
                                    {day.appointments.length > 3 && (
                                        <div className="text-xs text-muted-foreground">
                                            +{day.appointments.length - 3} mais
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
