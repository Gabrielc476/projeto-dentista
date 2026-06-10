import { useState, useEffect } from 'react';
import { Appointment, AppointmentFormData, Patient, Procedure, ShiftType, SHIFT_NAMES } from '@/types';
import { appointmentService } from '@/features/appointments/services/appointment.service';
import { patientService } from '@/features/patients/services/patient.service';
import { procedureService } from '@/features/procedures/services/procedure.service';
import { clinicRentalService } from '@/features/clinic-rentals/services/clinic-rental.service';
import { toast } from 'sonner';
import { useConfirm } from '@/contexts/ConfirmContext';

// Helper to determine shift from time
function getShiftFromTime(date: Date): ShiftType {
    const hours = date.getHours();
    if (hours >= 8 && hours < 12) return 'morning';
    if (hours >= 14 && hours < 18) return 'afternoon';
    if (hours >= 18 && hours < 22) return 'evening';
    // Default to morning for times outside standard shifts
    return 'morning';
}

interface ProcedureSelection {
    id: string;
    quantity: number;
    unitPrice?: number;
}

export function useAppointments() {
    const confirm = useConfirm();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [procedures, setProcedures] = useState<Procedure[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [selectedProcedures, setSelectedProcedures] = useState<ProcedureSelection[]>([]);
    const [formData, setFormData] = useState({
        patientId: '',
        scheduledDate: '',
        status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled' | 'no_show',
        notes: '',
        totalValue: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        // Auto-calculate totalValue when procedures change
        const total = selectedProcedures.reduce((sum, proc) => {
            const procedure = procedures.find(p => p.id === proc.id);
            const price = proc.unitPrice ?? procedure?.defaultPrice ?? 0;
            return sum + (price * proc.quantity);
        }, 0);
        setFormData(prev => ({ ...prev, totalValue: total }));
    }, [selectedProcedures, procedures]);

    const loadData = async () => {
        try {
            const [appointmentsData, patientsData, proceduresData] = await Promise.all([
                appointmentService.getAll(),
                patientService.getAll(),
                procedureService.getAll(),
            ]);
            setAppointments(appointmentsData);
            setPatients(patientsData);
            setProcedures(proceduresData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Erro ao carregar dados. Verifique se o backend está rodando.');
        } finally {
            setLoading(false);
        }
    };

    const openDialog = () => {
        resetForm();
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        resetForm();
    };

    const handleFormChange = (updates: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (submitting) return;

        if (selectedProcedures.length === 0) {
            toast.warning('Selecione pelo menos um procedimento');
            return;
        }

        // Check for scheduling conflicts
        const newAppointmentDate = new Date(formData.scheduledDate);
        const conflicts = appointments.filter(apt => {
            // Skip if editing the same appointment
            if (editingAppointment && apt.id === editingAppointment.id) {
                return false;
            }

            // Only check scheduled appointments
            if (apt.status !== 'scheduled') {
                return false;
            }

            const existingDate = new Date(apt.scheduledDate);
            const timeDiffMs = Math.abs(newAppointmentDate.getTime() - existingDate.getTime());
            const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

            return timeDiffHours <= 1; // Conflict if within 1 hour
        });

        if (conflicts.length > 0) {
            const conflictTimes = conflicts.map(apt =>
                `${apt.pacienteNome} às ${new Date(apt.scheduledDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
            ).join(', ');

            const proceed = await confirm({
                title: '⚠️ Conflito de Agenda!',
                description: `A consulta que você está agendando está muito próxima de: ${conflictTimes}. Deseja continuar mesmo assim?`,
                confirmText: 'Continuar',
                cancelText: 'Cancelar',
                variant: 'destructive'
            });

            if (!proceed) {
                return;
            }
        }

        // Check for conflicts with clinic rentals
        try {
            const appointmentDate = new Date(formData.scheduledDate);
            const dateStr = appointmentDate.toISOString().split('T')[0];
            const appointmentShift = getShiftFromTime(appointmentDate);

            // Fetch rentals for the same date
            const rentals = await clinicRentalService.getAll(dateStr, dateStr);

            // Check if there's a rental in the same shift
            const conflictingRentals = rentals.filter(rental => {
                const rentalDate = typeof rental.date === 'string'
                    ? rental.date.split('T')[0]
                    : new Date(rental.date).toISOString().split('T')[0];
                return rentalDate === dateStr && rental.shift === appointmentShift;
            });

            if (conflictingRentals.length > 0) {
                const rentalInfo = conflictingRentals.map(r =>
                    `${r.doctorName} (${r.doctorType === 'fixed' ? 'Fixo' : 'Avulso'})`
                ).join(', ');

                const proceed = await confirm({
                    title: '⚠️ Locação Existente!',
                    description: `Já existe uma locação de sala para o turno ${SHIFT_NAMES[appointmentShift]} neste dia (${rentalInfo}). A sala pode estar ocupada por outro médico. Deseja continuar mesmo assim?`,
                    confirmText: 'Continuar',
                    cancelText: 'Cancelar',
                    variant: 'destructive'
                });

                if (!proceed) {
                    return;
                }
            }
        } catch (error) {
            console.error('Error checking rental conflicts:', error);
            // Continue anyway if we can't check rentals
        }

        setSubmitting(true);
        try {
            // Remove empty string fields for optional fields
            const cleanedData: any = {
                ...formData,
                procedures: selectedProcedures,
            };
            if (!cleanedData.notes) delete cleanedData.notes;

            if (editingAppointment) {
                await appointmentService.update(editingAppointment.id, {
                    patientId: formData.patientId,
                    scheduledDate: formData.scheduledDate,
                    status: formData.status,
                    notes: formData.notes || undefined,
                    totalValue: formData.totalValue,
                });
                toast.success('Consulta atualizada com sucesso!');
            } else {
                await appointmentService.create(cleanedData);
                toast.success('Consulta agendada com sucesso!');
            }
            closeDialog();
            loadData();
        } catch (error: any) {
            console.error('Error saving appointment:', error);
            toast.error(error.message || 'Erro ao salvar consulta');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setFormData({
            patientId: appointment.patientId,
            scheduledDate: typeof appointment.scheduledDate === 'string'
                ? appointment.scheduledDate.split('T')[0]
                : new Date(appointment.scheduledDate).toISOString().split('T')[0],
            status: appointment.status,
            notes: appointment.notes || '',
            totalValue: appointment.totalValue || 0,
        });

        if (appointment.procedimentos) {
            setSelectedProcedures(appointment.procedimentos.map(p => ({
                id: p.id,
                quantity: p.quantity,
                unitPrice: p.unitPrice,
            })));
        }

        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        const proceed = await confirm({
            title: 'Deletar Consulta',
            description: 'Tem certeza que deseja deletar esta consulta? Esta ação não pode ser desfeita.',
            confirmText: 'Deletar',
            cancelText: 'Cancelar',
            variant: 'destructive'
        });
        if (!proceed) return;

        try {
            await appointmentService.delete(id);
            toast.success('Consulta deletada com sucesso!');
            loadData();
        } catch (error: any) {
            console.error('Erro ao deletar consulta:', error);
            toast.error(error.message || 'Erro ao deletar consulta');
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await appointmentService.update(id, { status: newStatus as any });
            toast.success('Status da consulta atualizado!');
            loadData();
        } catch (error: any) {
            console.error('Erro ao atualizar status:', error);
            toast.error(error.message || 'Erro ao atualizar status da consulta');
        }
    };

    const resetForm = () => {
        setEditingAppointment(null);
        setFormData({
            patientId: '',
            scheduledDate: '',
            status: 'scheduled',
            notes: '',
            totalValue: 0,
        });
        setSelectedProcedures([]);
    };

    const addProcedure = () => {
        if (procedures.length === 0) return;
        const firstProcedure = procedures[0];
        setSelectedProcedures([...selectedProcedures, {
            id: firstProcedure.id,
            quantity: 1,
            unitPrice: firstProcedure.defaultPrice,
        }]);
    };

    const removeProcedure = (index: number) => {
        setSelectedProcedures(selectedProcedures.filter((_, i) => i !== index));
    };

    const updateProcedure = (index: number, field: string, value: any) => {
        const updated = [...selectedProcedures];

        // Handle multi-field update to avoid stale state
        if (field === 'multi' && typeof value === 'object') {
            updated[index] = { ...updated[index], ...value };
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }

        setSelectedProcedures(updated);
    };

    const handlePatientCreated = (patient: Patient) => {
        // Add new patient to the list and keep it updated
        setPatients(prev => [...prev, patient].sort((a, b) => a.name.localeCompare(b.name)));
    };

    const handleProcedureCreated = (procedure: Procedure) => {
        // Add new procedure to the list and keep it updated
        setProcedures(prev => [...prev, procedure].sort((a, b) => a.name.localeCompare(b.name)));
    };

    return {
        appointments,
        patients,
        procedures,
        loading,
        submitting,
        dialogOpen,
        formData,
        editingAppointment,
        selectedProcedures,
        openDialog,
        closeDialog,
        handleFormChange,
        handleSubmit,
        handleEdit,
        handleDelete,
        handleStatusChange,
        addProcedure,
        removeProcedure,
        updateProcedure,
        handlePatientCreated,
        handleProcedureCreated,
    };
}

