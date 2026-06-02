import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
    currentDate: Date;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
}

export function CalendarHeader({
    currentDate,
    onPreviousMonth,
    onNextMonth,
    onToday
}: CalendarHeaderProps) {
    const monthYear = currentDate.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground capitalize">
                {monthYear}
            </h1>

            <div className="flex gap-2">
                <Button variant="outline" onClick={onToday}>
                    Hoje
                </Button>
                <div className="flex gap-1">
                    <Button variant="outline" size="icon" onClick={onPreviousMonth}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={onNextMonth}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
