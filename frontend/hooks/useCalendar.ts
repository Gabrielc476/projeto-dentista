import { useState, useEffect, useMemo } from 'react';
import { Appointment } from '@/types';
import { appointmentService } from '@/features/appointments/services/appointment.service';

export function useCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            const data = await appointmentService.getAll();
            setAppointments(data);
        } catch (error) {
            console.error('Error loading appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    // Generate calendar grid for current month
    const calendarDays = useMemo(() => {
        const getAppointmentsForDate = (date: Date) => {
            return appointments.filter(apt => {
                const aptDate = new Date(apt.scheduledDate);
                return aptDate.getDate() === date.getDate() &&
                    aptDate.getMonth() === date.getMonth() &&
                    aptDate.getFullYear() === date.getFullYear();
            });
        };

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // First day of month
        const firstDay = new Date(year, month, 1);
        const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

        // Last day of month
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        // Previous month padding
        const prevMonthLastDay = new Date(year, month, 0);
        const prevMonthDays = prevMonthLastDay.getDate();

        const days: Array<{
            date: Date;
            isCurrentMonth: boolean;
            appointments: Appointment[];
        }> = [];

        // Add previous month days
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, prevMonthDays - i);
            days.push({
                date,
                isCurrentMonth: false,
                appointments: getAppointmentsForDate(date)
            });
        }

        // Add current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            days.push({
                date,
                isCurrentMonth: true,
                appointments: getAppointmentsForDate(date)
            });
        }

        // Add next month days to complete the grid
        const remainingDays = 42 - days.length; // 6 weeks * 7 days
        for (let day = 1; day <= remainingDays; day++) {
            const date = new Date(year, month + 1, day);
            days.push({
                date,
                isCurrentMonth: false,
                appointments: getAppointmentsForDate(date)
            });
        }

        return days;
    }, [currentDate, appointments]);

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    return {
        currentDate,
        calendarDays,
        loading,
        goToNextMonth,
        goToPreviousMonth,
        goToToday,
    };
}
