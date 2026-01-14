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
    Clock,
    Sun,
    Sunset,
    Moon,
    Sparkles
} from 'lucide-react';

interface DateTimePickerProps {
    value: string;  // ISO format: YYYY-MM-DDTHH:mm
    onChange: (value: string) => void;
    placeholder?: string;
    busySlots?: string[]; // List of busy date-times in ISO format (legacy)
    fullyOccupiedDates?: string[]; // Dates that are completely booked (YYYY-MM-DD)
    isTimeSlotBusy?: (date: string, time: string) => boolean; // Function to check if a specific slot is busy
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Time slots with smart suggestions
const TIME_PRESETS = [
    { label: 'Manhã', icon: Sun, times: ['08:00', '09:00', '10:00', '11:00'] },
    { label: 'Tarde', icon: Sunset, times: ['14:00', '15:00', '16:00', '17:00'] },
    { label: 'Noite', icon: Moon, times: ['18:00', '19:00', '20:00', '21:00'] },
];

export function DateTimePicker({
    value,
    onChange,
    placeholder = 'Selecione data e hora',
    busySlots = [],
    fullyOccupiedDates = [],
    isTimeSlotBusy: externalIsTimeSlotBusy,
}: DateTimePickerProps) {
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<'calendar' | 'time'>('calendar');
    const [viewMonth, setViewMonth] = useState(() => {
        if (value) {
            const date = new Date(value);
            return new Date(date.getFullYear(), date.getMonth(), 1);
        }
        return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    });

    // Parse current value
    const selectedDate = useMemo(() => {
        if (!value) return null;
        return new Date(value);
    }, [value]);

    const selectedDateStr = selectedDate
        ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
        : '';

    const selectedTime = selectedDate
        ? `${String(selectedDate.getHours()).padStart(2, '0')}:${String(selectedDate.getMinutes()).padStart(2, '0')}`
        : '';

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

    // Check if a date is FULLY occupied (all shifts busy) - only then show day as red
    const isFullyOccupied = (date: Date): boolean => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return fullyOccupiedDates.includes(dateStr);
    };

    // Check if a date has any busy slots (for showing indicator dot)
    const hasBusySlots = (date: Date): boolean => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        // Check legacy busySlots or external function
        if (busySlots.some(slot => slot.startsWith(dateStr))) return true;
        if (externalIsTimeSlotBusy) {
            // Check if any time slot is busy
            for (const preset of TIME_PRESETS) {
                for (const time of preset.times) {
                    if (externalIsTimeSlotBusy(dateStr, time)) return true;
                }
            }
        }
        return false;
    };

    // Check if a specific time is busy for selected date
    const isTimeBusy = (time: string): boolean => {
        if (!selectedDateStr) return false;

        // Use external function if provided
        if (externalIsTimeSlotBusy) {
            return externalIsTimeSlotBusy(selectedDateStr, time);
        }

        // Fallback to legacy busySlots
        return busySlots.some(slot => {
            const slotTime = slot.split('T')[1]?.slice(0, 5);
            const slotDate = slot.split('T')[0];
            return slotDate === selectedDateStr && slotTime === time;
        });
    };

    // Count busy slots for a date
    const countBusySlots = (date: Date): number => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return busySlots.filter(slot => slot.startsWith(dateStr)).length;
    };

    const handleDateClick = (date: Date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const time = selectedTime || '09:00';
        onChange(`${dateStr}T${time}`);
        setView('time');
    };

    const handleTimeClick = (time: string) => {
        if (!selectedDateStr) {
            // If no date selected, use today
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            onChange(`${todayStr}T${time}`);
        } else {
            onChange(`${selectedDateStr}T${time}`);
        }
        setOpen(false);
    };

    const handleQuickSelect = (daysFromNow: number, time: string) => {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        onChange(`${dateStr}T${time}`);
        setOpen(false);
    };

    const navigateMonth = (delta: number) => {
        setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const formatDisplayValue = () => {
        if (!selectedDate) return null;

        const day = selectedDate.getDate();
        const month = MONTHS[selectedDate.getMonth()];
        const hours = String(selectedDate.getHours()).padStart(2, '0');
        const minutes = String(selectedDate.getMinutes()).padStart(2, '0');

        const daysDiff = Math.floor((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        let prefix = '';
        if (daysDiff === 0) prefix = 'Hoje, ';
        else if (daysDiff === 1) prefix = 'Amanhã, ';
        else if (daysDiff === -1) prefix = 'Ontem, ';

        return `${prefix}${day} de ${month} às ${hours}:${minutes}`;
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
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex">
                    {/* Calendar Side */}
                    <div className="p-4 border-r">
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
                                                isFullyOccupied(date) && !isSelected(date) && "bg-red-200 text-red-700 dark:bg-red-900/50 dark:text-red-300 line-through"
                                            )}
                                            title={isFullyOccupied(date) ? 'Dia totalmente ocupado' : ''}
                                        >
                                            {date.getDate()}
                                            {/* Show dot for partially busy days (not fully occupied) */}
                                            {hasBusySlots(date) && !isFullyOccupied(date) && (
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
                                    onClick={() => handleQuickSelect(0, '09:00')}
                                >
                                    <Sparkles className="h-3 w-3" />
                                    Hoje 9h
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs"
                                    onClick={() => handleQuickSelect(1, '09:00')}
                                >
                                    Amanhã 9h
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Time Side */}
                    <div className="p-4 w-[180px]">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold text-sm">Horário</h3>
                        </div>

                        <div className="space-y-4">
                            {TIME_PRESETS.map((preset) => (
                                <div key={preset.label}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <preset.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground font-medium">
                                            {preset.label}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {preset.times.map((time) => {
                                            const busy = isTimeBusy(time);
                                            return (
                                                <button
                                                    key={time}
                                                    onClick={() => handleTimeClick(time)}
                                                    className={cn(
                                                        "px-2 py-1.5 text-sm rounded-md transition-all relative",
                                                        "hover:bg-primary/10 hover:text-primary",
                                                        "focus:outline-none focus:ring-2 focus:ring-primary/20",
                                                        selectedTime === time && "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
                                                        busy && selectedTime !== time && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 line-through"
                                                    )}
                                                    title={busy ? 'Horário ocupado' : ''}
                                                >
                                                    {time}
                                                    {busy && (
                                                        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Current Selection */}
                        {selectedDate && (
                            <div className="mt-4 pt-4 border-t">
                                <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                                    <p className="text-xs text-muted-foreground mb-1">Selecionado</p>
                                    <p className="text-sm font-semibold">
                                        {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()].slice(0, 3)}
                                        {' às '}
                                        {selectedTime || '--:--'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
