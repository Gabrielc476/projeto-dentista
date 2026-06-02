'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Sparkles
} from 'lucide-react';

import { ShiftType } from '@/types';

interface DatePickerProps {
    value: string;  // ISO format: YYYY-MM-DD
    onChange: (value: string) => void;
    placeholder?: string;
    busyDates?: string[]; // List of busy dates in YYYY-MM-DD format (legacy)
    fullyOccupiedDates?: string[]; // Dates that are completely booked (all shifts)
    isDatePartiallyBusy?: (date: string) => boolean; // Check if date has some busy shifts
    selectedShift?: ShiftType; // Current shift being selected
    isShiftBusy?: (date: string, shift: ShiftType) => boolean; // Check if specific shift is busy
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function DatePicker({
    value,
    onChange,
    placeholder = 'Selecione uma data',
    busyDates = [],
    fullyOccupiedDates = [],
    isDatePartiallyBusy,
    selectedShift,
    isShiftBusy,
}: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const [viewMonth, setViewMonth] = useState(() => {
        if (value) {
            const [year, month] = value.split('-').map(Number);
            return new Date(year, month - 1, 1);
        }
        return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    });

    // Parse current value
    const selectedDate = useMemo(() => {
        if (!value) return null;
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }, [value]);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const year = viewMonth.getFullYear();
        const month = viewMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const days: (Date | null)[] = [];

        // Padding for start of month
        for (let i = 0; i < startPadding; i++) {
            days.push(null);
        }

        // Days of the month
        for (let i = 1; i <= totalDays; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    }, [viewMonth]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = (date: Date) => {
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date: Date) => {
        if (!selectedDate) return false;
        return date.toDateString() === selectedDate.toDateString();
    };

    const isPast = (date: Date) => {
        return date < today;
    };

    // Check if a date is fully occupied (all 3 shifts busy)
    const isFullyOccupied = (date: Date): boolean => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return fullyOccupiedDates.includes(dateStr);
    };

    // Check if date has any busy shifts (for orange dot indicator)
    const hasAnyBusyShifts = (date: Date): boolean => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        // Check legacy busyDates
        if (busyDates.includes(dateStr)) return true;
        // Check external function
        if (isDatePartiallyBusy) return isDatePartiallyBusy(dateStr);
        // Check isShiftBusy for any shift
        if (isShiftBusy) {
            return isShiftBusy(dateStr, 'morning') || isShiftBusy(dateStr, 'afternoon') || isShiftBusy(dateStr, 'evening');
        }
        return false;
    };

    // Check if the selected shift is busy on a date
    const isSelectedShiftBusy = (date: Date): boolean => {
        if (!selectedShift || !isShiftBusy) return false;
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return isShiftBusy(dateStr, selectedShift);
    };

    const handleDateClick = (date: Date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        onChange(dateStr);
        setOpen(false);
    };

    const handleQuickSelect = (daysFromNow: number) => {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        onChange(dateStr);
        setOpen(false);
    };

    const navigateMonth = (delta: number) => {
        setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const formatDisplayValue = () => {
        if (!selectedDate) return null;

        const day = selectedDate.getDate();
        const month = MONTHS[selectedDate.getMonth()];
        const year = selectedDate.getFullYear();

        const daysDiff = Math.floor((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) return `Hoje, ${day} de ${month}`;
        if (daysDiff === 1) return `Amanhã, ${day} de ${month}`;
        if (daysDiff === -1) return `Ontem, ${day} de ${month}`;

        return `${day} de ${month} de ${year}`;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground"
                    )}
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDisplayValue() || placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigateMonth(-1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="font-semibold text-sm">
                        {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                    </h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigateMonth(1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {WEEKDAYS.map((day) => (
                        <div
                            key={day}
                            className="h-8 w-8 flex items-center justify-center text-xs text-muted-foreground font-medium"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((date, index) => (
                        <div key={index} className="h-8 w-8">
                            {date && (
                                <button
                                    onClick={() => handleDateClick(date)}
                                    disabled={isPast(date) || isFullyOccupied(date)}
                                    className={cn(
                                        "h-8 w-8 rounded-full text-sm font-medium transition-all relative",
                                        "hover:bg-primary/10 hover:text-primary",
                                        "focus:outline-none focus:ring-2 focus:ring-primary/20",
                                        "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                                        isToday(date) && !isSelected(date) && !isFullyOccupied(date) && "border-2 border-primary/50",
                                        isSelected(date) && "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:from-primary hover:to-primary/90",
                                        // Fully occupied = red background (day blocked)
                                        isFullyOccupied(date) && !isSelected(date) && "bg-red-200 text-red-700 dark:bg-red-900/50 dark:text-red-300 line-through",
                                        // Selected shift is busy on this date = orange background
                                        isSelectedShiftBusy(date) && !isSelected(date) && !isFullyOccupied(date) && "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                                    )}
                                    title={
                                        isFullyOccupied(date) ? 'Dia totalmente ocupado' :
                                            isSelectedShiftBusy(date) ? 'Turno selecionado ocupado' : ''
                                    }
                                >
                                    {date.getDate()}
                                    {/* Orange dot for partially busy days */}
                                    {hasAnyBusyShifts(date) && !isFullyOccupied(date) && !isSelectedShiftBusy(date) && (
                                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-orange-500" />
                                    )}
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-4 pt-4 border-t space-y-2">
                    <p className="text-xs text-muted-foreground font-medium mb-2">Atalhos rápidos</p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs gap-1"
                            onClick={() => handleQuickSelect(0)}
                        >
                            <Sparkles className="h-3 w-3" />
                            Hoje
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleQuickSelect(1)}
                        >
                            Amanhã
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleQuickSelect(7)}
                        >
                            +7 dias
                        </Button>
                    </div>
                </div>

                {/* Legend */}
                {busyDates.length > 0 && (
                    <div className="mt-3 pt-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            Com locação
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
