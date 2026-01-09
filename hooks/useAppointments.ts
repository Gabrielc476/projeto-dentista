import { useState, useEffect } from 'react';
import { Appointment, AppointmentFormData, Patient, Procedure } from '@/types';
import { appointmentService } from '@/features/appointments/services/appointment.service';
import { patientService } from '@/features/patients/services/patient.service';
import { procedureService } from '@/features/procedures/services/procedure.service';

interface ProcedureSelection {
    id: string;
    quantity: number;
    unitPrice?: number;
}

export function useAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [procedures, setProcedures] = useState<Procedure[]>([]);
    const [loading, setLoading] = useState(true);
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
            alert('Erro ao carregar dados. Verifique se o backend está rodando.');
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

        if (selectedProcedures.length === 0) {
            alert('Selecione pelo menos um procedimento');
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
                `${apt.pacienteNome} - ${new Date(apt.scheduledDate).toLocaleString('pt-BR')}`
            ).join('\n');

            const proceed = window.confirm(
                `⚠️ CONFLITO DE AGENDA!\n\n` +
                `A consulta que você está agendando está muito próxima de:\n\n${conflictTimes}\n\n` +
                `Deseja continuar mesmo assim?`
            );

            if (!proceed) {
                return;
            }
        }

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
            } else {
                await appointmentService.create(cleanedData);
            }
            closeDialog();
            loadData();
        } catch (error) {
            console.error('Error saving appointment:', error);
            alert('Erro ao salvar consulta');
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
        if (!confirm('Tem certeza que deseja deletar esta consulta?')) return;

        try {
            await appointmentService.delete(id);
            loadData();
        } catch (error) {
            console.error('Erro ao deletar consulta:', error);
            alert('Erro ao deletar consulta');
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await appointmentService.update(id, { status: newStatus as any });
            loadData();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Erro ao atualizar status da consulta');
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

    return {
        appointments,
        patients,
        procedures,
        loading,
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
    };
}

