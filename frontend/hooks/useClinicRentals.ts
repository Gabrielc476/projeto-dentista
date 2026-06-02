import { useState, useEffect, useCallback } from 'react';
import { ClinicRental, ClinicRentalFormData, ShiftType, Doctor, CalendarItem, Appointment } from '@/types';
import { clinicRentalService } from '@/features/clinic-rentals/services/clinic-rental.service';
import { doctorService } from '@/features/doctors/services/doctor.service';
import { appointmentService } from '@/features/appointments/services/appointment.service';

// Helper to get start of week (Monday)
function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

// Helper to determine shift from time
function getShiftFromTime(date: Date): ShiftType {
    const hours = date.getHours();
    if (hours >= 8 && hours < 12) return 'morning';
    if (hours >= 14 && hours < 18) return 'afternoon';
    if (hours >= 18 && hours < 22) return 'evening';
    // Default to morning for times outside standard shifts
    return 'morning';
}

export function useClinicRentals() {
    const [rentals, setRentals] = useState<ClinicRental[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRental, setEditingRental] = useState<ClinicRental | null>(null);
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()));
    const [formData, setFormData] = useState<ClinicRentalFormData>({
        doctorId: '',
        date: formatDate(new Date()),
        shift: 'morning',
        notes: '',
    });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const weekStart = formatDate(currentWeekStart);
            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            const weekEndStr = formatDate(weekEnd);

            // Load rentals and appointments in parallel
            const [rentalsData, appointmentsData] = await Promise.all([
                clinicRentalService.getByWeek(weekStart),
                appointmentService.getByDateRange(weekStart, weekEndStr)
            ]);

            setRentals(rentalsData);
            setAppointments(appointmentsData);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Erro ao carregar dados.');
        } finally {
            setLoading(false);
        }
    }, [currentWeekStart]);

    const loadDoctors = async () => {
        try {
            const data = await doctorService.getAll();
            setDoctors(data);
        } catch (error) {
            console.error('Error loading doctors:', error);
        }
    };

    useEffect(() => {
        loadDoctors();
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const goToPreviousWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentWeekStart(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentWeekStart(newDate);
    };

    const goToCurrentWeek = () => {
        setCurrentWeekStart(getWeekStart(new Date()));
    };

    const openDialog = (date?: string, shift?: ShiftType) => {
        resetForm();
        if (date) {
            setFormData(prev => ({ ...prev, date }));
        }
        if (shift) {
            setFormData(prev => ({ ...prev, shift }));
        }
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        resetForm();
    };

    const handleFormChange = (data: ClinicRentalFormData) => {
        setFormData(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            const cleanedData = { ...formData };
            if (!cleanedData.notes) delete cleanedData.notes;

            if (editingRental) {
                await clinicRentalService.update(editingRental.id, cleanedData);
            } else {
                await clinicRentalService.create(cleanedData);
            }
            closeDialog();
            loadData();
        } catch (error: any) {
            console.error('Error saving rental:', error);
            const message = error?.message?.includes('já está ocupado')
                ? error.message
                : 'Erro ao salvar locação';
            alert(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (rental: ClinicRental) => {
        setEditingRental(rental);
        const dateStr = typeof rental.date === 'string'
            ? rental.date.split('T')[0]
            : formatDate(new Date(rental.date));
        setFormData({
            doctorId: rental.doctorId,
            date: dateStr,
            shift: rental.shift,
            notes: rental.notes || '',
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover esta locação?')) return;

        try {
            await clinicRentalService.delete(id);
            loadData();
        } catch (error) {
            alert('Erro ao deletar locação');
        }
    };

    const resetForm = () => {
        setEditingRental(null);
        setFormData({
            doctorId: '',
            date: formatDate(new Date()),
            shift: 'morning',
            notes: '',
        });
    };

    // Get week days for calendar view
    const getWeekDays = (): Date[] => {
        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(currentWeekStart);
            day.setDate(day.getDate() + i);
            days.push(day);
        }
        return days;
    };

    // Get items for specific date and shift (both rentals and appointments)
    const getItemsForSlot = (date: Date, shift: ShiftType): CalendarItem[] => {
        const dateStr = formatDate(date);
        const items: CalendarItem[] = [];

        // Find matching rentals
        const rental = rentals.find(r => {
            const rentalDate = typeof r.date === 'string'
                ? r.date.split('T')[0]
                : formatDate(new Date(r.date));
            return rentalDate === dateStr && r.shift === shift;
        });

        if (rental) {
            items.push({
                id: rental.id,
                type: 'rental',
                date: rental.date,
                shift: rental.shift,
                doctorName: rental.doctorName,
                doctorType: rental.doctorType,
            });
        }

        // Find matching appointments
        const matchingAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.scheduledDate);
            const aptDateStr = formatDate(aptDate);
            const aptShift = getShiftFromTime(aptDate);
            return aptDateStr === dateStr && aptShift === shift;
        });

        matchingAppointments.forEach(apt => {
            const aptDate = new Date(apt.scheduledDate);
            items.push({
                id: apt.id,
                type: 'appointment',
                date: apt.scheduledDate,
                shift: getShiftFromTime(aptDate),
                patientName: apt.pacienteNome,
                scheduledTime: aptDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                status: apt.status,
            });
        });

        return items;
    };

    const handleDoctorCreated = (doctor: Doctor) => {
        // Add new doctor to the list and keep it updated
        setDoctors(prev => [...prev, doctor].sort((a, b) => a.name.localeCompare(b.name)));
    };

    return {
        rentals,
        appointments,
        doctors,
        loading,
        submitting,
        dialogOpen,
        formData,
        editingRental,
        currentWeekStart,
        weekDays: getWeekDays(),
        goToPreviousWeek,
        goToNextWeek,
        goToCurrentWeek,
        openDialog,
        closeDialog,
        handleFormChange,
        handleSubmit,
        handleEdit,
        handleDelete,
        getItemsForSlot,
        formatDate,
        handleDoctorCreated,
    };
}
