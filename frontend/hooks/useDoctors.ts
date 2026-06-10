import { useState, useEffect } from 'react';
import { Doctor, DoctorFormData, DoctorType } from '@/types';
import { doctorService } from '@/features/doctors/services/doctor.service';
import { toast } from 'sonner';
import { useConfirm } from '@/contexts/ConfirmContext';

export function useDoctors() {
    const confirm = useConfirm();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
    const [filterType, setFilterType] = useState<DoctorType | 'all'>('all');
    const [formData, setFormData] = useState<DoctorFormData>({
        name: '',
        phone: '',
        type: 'temporary',
        notes: '',
        fixedWeekdays: [],
        fixedShift: undefined,
        fixedStartDate: undefined,
        fixedEndDate: undefined,
    });

    useEffect(() => {
        loadDoctors();
    }, [filterType]);

    const loadDoctors = async () => {
        try {
            setLoading(true);
            const typeFilter = filterType === 'all' ? undefined : filterType;
            const data = await doctorService.getAll(typeFilter);
            setDoctors(data);
        } catch (error) {
            console.error('Error loading doctors:', error);
            toast.error('Erro ao carregar médicos. Verifique se o backend está rodando.');
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

    const handleFormChange = (data: DoctorFormData) => {
        setFormData(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            const cleanedData = { ...formData };
            if (!cleanedData.notes) delete cleanedData.notes;
            
            // Allow clearing date fields by sending null on update
            if (!cleanedData.fixedStartDate) {
                cleanedData.fixedStartDate = editingDoctor ? (null as any) : undefined;
            }
            if (!cleanedData.fixedEndDate) {
                cleanedData.fixedEndDate = editingDoctor ? (null as any) : undefined;
            }

            if (editingDoctor) {
                await doctorService.update(editingDoctor.id, cleanedData);
                toast.success('Médico atualizado com sucesso!');
            } else {
                await doctorService.create(cleanedData);
                toast.success('Médico cadastrado com sucesso!');
            }
            closeDialog();
            loadDoctors();
        } catch (error: any) {
            console.error('Error saving doctor:', error);
            toast.error(error.message || 'Erro ao salvar médico');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (doctor: Doctor) => {
        setEditingDoctor(doctor);
        
        const formatDateString = (dateVal: any) => {
            if (!dateVal) return undefined;
            const d = new Date(dateVal);
            if (isNaN(d.getTime())) return undefined;
            return d.toISOString().split('T')[0];
        };

        setFormData({
            name: doctor.name,
            phone: doctor.phone,
            type: doctor.type,
            notes: doctor.notes || '',
            fixedWeekdays: doctor.fixedWeekdays || [],
            fixedShift: doctor.fixedShift,
            fixedStartDate: formatDateString(doctor.fixedStartDate),
            fixedEndDate: formatDateString(doctor.fixedEndDate),
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        const proceed = await confirm({
            title: 'Deletar Médico',
            description: 'Tem certeza que deseja deletar este médico? Isso também removerá todas as locações associadas e esta ação não poderá ser desfeita.',
            confirmText: 'Deletar',
            cancelText: 'Cancelar',
            variant: 'destructive'
        });
        if (!proceed) return;

        try {
            await doctorService.delete(id);
            toast.success('Médico removido com sucesso!');
            loadDoctors();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao deletar médico');
        }
    };

    const resetForm = () => {
        setEditingDoctor(null);
        setFormData({
            name: '',
            phone: '',
            type: 'temporary',
            notes: '',
            fixedWeekdays: [],
            fixedShift: undefined,
            fixedStartDate: undefined,
            fixedEndDate: undefined,
        });
    };

    return {
        doctors,
        loading,
        submitting,
        dialogOpen,
        formData,
        editingDoctor,
        filterType,
        setFilterType,
        openDialog,
        closeDialog,
        handleFormChange,
        handleSubmit,
        handleEdit,
        handleDelete,
    };
}
