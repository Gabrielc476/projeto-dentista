import { useState, useEffect, useCallback } from 'react';
import { ClinicRental, ClinicRentalFormData, ShiftType, Doctor } from '@/types';
import { clinicRentalService } from '@/features/clinic-rentals/services/clinic-rental.service';
import { doctorService } from '@/features/doctors/services/doctor.service';

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

export function useClinicRentals() {
    const [rentals, setRentals] = useState<ClinicRental[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRental, setEditingRental] = useState<ClinicRental | null>(null);
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()));
    const [formData, setFormData] = useState<ClinicRentalFormData>({
        doctorId: '',
        date: formatDate(new Date()),
        shift: 'morning',
        notes: '',
    });

    const loadRentals = useCallback(async () => {
        try {
            setLoading(true);
            const weekStart = formatDate(currentWeekStart);
            const data = await clinicRentalService.getByWeek(weekStart);
            setRentals(data);
        } catch (error) {
            console.error('Error loading rentals:', error);
            alert('Erro ao carregar locações.');
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
        loadRentals();
    }, [loadRentals]);

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
        try {
            const cleanedData = { ...formData };
            if (!cleanedData.notes) delete cleanedData.notes;

            if (editingRental) {
                await clinicRentalService.update(editingRental.id, cleanedData);
            } else {
                await clinicRentalService.create(cleanedData);
            }
            closeDialog();
            loadRentals();
        } catch (error: any) {
            console.error('Error saving rental:', error);
            const message = error?.message?.includes('já está ocupado')
                ? error.message
                : 'Erro ao salvar locação';
            alert(message);
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
            loadRentals();
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

    // Get rental for specific date and shift
    const getRentalForSlot = (date: Date, shift: ShiftType): ClinicRental | undefined => {
        const dateStr = formatDate(date);
        return rentals.find(r => {
            const rentalDate = typeof r.date === 'string'
                ? r.date.split('T')[0]
                : formatDate(new Date(r.date));
            return rentalDate === dateStr && r.shift === shift;
        });
    };

    return {
        rentals,
        doctors,
        loading,
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
        getRentalForSlot,
        formatDate,
    };
}
