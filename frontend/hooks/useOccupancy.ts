'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { appointmentService } from '@/features/appointments/services/appointment.service';
import { clinicRentalService } from '@/features/clinic-rentals/services/clinic-rental.service';
import { Appointment, ClinicRental, ShiftType } from '@/types';

// Map appointment times to shifts
// Morning: 08:00-11:59, Afternoon: 12:00-17:59, Evening: 18:00-21:59
function getShiftFromTime(time: string): ShiftType {
    const hour = parseInt(time.split(':')[0], 10);
    if (hour >= 8 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
}

// Map shift to time range for display
export const SHIFT_TIME_RANGES: Record<ShiftType, string[]> = {
    morning: ['08:00', '09:00', '10:00', '11:00'],
    afternoon: ['14:00', '15:00', '16:00', '17:00'],
    evening: ['18:00', '19:00', '20:00', '21:00'],
};

export interface OccupancyData {
    // Busy date-times from appointments (YYYY-MM-DDTHH:mm format)
    busyAppointmentSlots: string[];
    // Busy date+shift combinations from rentals ({date, shift})
    busyRentalSlots: { date: string; shift: ShiftType }[];
    // Fully occupied dates (all 3 shifts busy)
    fullyOccupiedDates: string[];
    // Loading state
    loading: boolean;
}

export function useOccupancy() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [rentals, setRentals] = useState<ClinicRental[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch all appointments and rentals
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [appointmentsData, rentalsData] = await Promise.all([
                appointmentService.getAll(),
                clinicRentalService.getAll(),
            ]);
            const filteredAppointments = appointmentsData.filter(a => a.status !== 'cancelled');
            setAppointments(filteredAppointments);
            setRentals(rentalsData);
        } catch (error) {
            console.error('Error fetching occupancy data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Process appointments to get busy slots
    const busyAppointmentSlots = useMemo(() => {
        return appointments.map(apt => {
            const rawDate = apt.scheduledDate;
            let date: Date;

            // Convert to Date object first (handles both Date and ISO string)
            if (rawDate instanceof Date) {
                date = rawDate;
            } else if (typeof rawDate === 'string') {
                date = new Date(rawDate);
            } else {
                return '';
            }

            // Check for invalid date
            if (isNaN(date.getTime())) return '';

            // Use local time components
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        }).filter(Boolean);
    }, [appointments]);

    // Process rentals to get busy slots
    const busyRentalSlots = useMemo(() => {
        return rentals.map(rental => {
            const date = rental.date;
            let dateStr: string;
            if (date instanceof Date) {
                dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            } else if (typeof date === 'string') {
                // Handle ISO string format (may include time)
                dateStr = date.split('T')[0];
            } else {
                dateStr = '';
            }
            return { date: dateStr, shift: rental.shift };
        }).filter(s => s.date);
    }, [rentals]);

    // Get shifts occupied by appointments on each date
    const appointmentShiftsByDate = useMemo(() => {
        const map: Record<string, Set<ShiftType>> = {};
        busyAppointmentSlots.forEach(slot => {
            const [date, time] = slot.split('T');
            if (!date || !time) return;
            const shift = getShiftFromTime(time);
            if (!map[date]) map[date] = new Set();
            map[date].add(shift);
        });
        return map;
    }, [busyAppointmentSlots]);

    // Get shifts occupied by rentals on each date
    const rentalShiftsByDate = useMemo(() => {
        const map: Record<string, Set<ShiftType>> = {};
        busyRentalSlots.forEach(slot => {
            if (!map[slot.date]) map[slot.date] = new Set();
            map[slot.date].add(slot.shift);
        });
        return map;
    }, [busyRentalSlots]);

    // Combine to find fully occupied dates
    const fullyOccupiedDates = useMemo(() => {
        const allDates = new Set([
            ...Object.keys(appointmentShiftsByDate),
            ...Object.keys(rentalShiftsByDate),
        ]);

        const fullyOccupied: string[] = [];
        allDates.forEach(date => {
            const appointmentShifts = appointmentShiftsByDate[date] || new Set();
            const rentalShifts = rentalShiftsByDate[date] || new Set();

            // Combine shifts from both sources
            const allShifts = new Set([...appointmentShifts, ...rentalShifts]);

            // If all 3 shifts are occupied, the date is fully occupied
            if (allShifts.has('morning') && allShifts.has('afternoon') && allShifts.has('evening')) {
                fullyOccupied.push(date);
            }
        });

        return fullyOccupied;
    }, [appointmentShiftsByDate, rentalShiftsByDate]);

    // Check if a specific time slot is busy (for appointments)
    const isTimeSlotBusy = useCallback((date: string, time: string): boolean => {
        const dateTimeStr = `${date}T${time}`;
        const shift = getShiftFromTime(time);

        // Check appointments
        const hasAppointment = busyAppointmentSlots.includes(dateTimeStr);

        // Check if the corresponding shift is rented
        const hasRental = busyRentalSlots.some(s => s.date === date && s.shift === shift);

        return hasAppointment || hasRental;
    }, [busyAppointmentSlots, busyRentalSlots]);

    // Check if a shift is busy on a date (for rentals)
    const isShiftBusy = useCallback((date: string, shift: ShiftType): boolean => {
        // Check if shift is rented
        if (busyRentalSlots.some(s => s.date === date && s.shift === shift)) return true;
        // Check if any appointment exists in this shift
        const appointmentShifts = appointmentShiftsByDate[date];
        return appointmentShifts?.has(shift) || false;
    }, [busyRentalSlots, appointmentShiftsByDate]);

    // Check if a date has any occupancy
    const hasAnyOccupancy = useCallback((date: string): boolean => {
        return (appointmentShiftsByDate[date]?.size || 0) > 0 ||
            (rentalShiftsByDate[date]?.size || 0) > 0;
    }, [appointmentShiftsByDate, rentalShiftsByDate]);

    // Get busy shifts for a specific date (combined from appointments and rentals)
    const getBusyShiftsForDate = useCallback((date: string): ShiftType[] => {
        const appointmentShifts = appointmentShiftsByDate[date] || new Set();
        const rentalShifts = rentalShiftsByDate[date] || new Set();
        return [...new Set([...appointmentShifts, ...rentalShifts])];
    }, [appointmentShiftsByDate, rentalShiftsByDate]);

    return {
        busyAppointmentSlots,
        busyRentalSlots,
        fullyOccupiedDates,
        loading,
        isTimeSlotBusy,
        isShiftBusy,
        hasAnyOccupancy,
        getBusyShiftsForDate,
        refetch: fetchData,
    };
}
