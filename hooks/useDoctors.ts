import { useState, useEffect } from 'react';
import { Doctor, DoctorFormData, DoctorType } from '@/types';
import { doctorService } from '@/features/doctors/services/doctor.service';

export function useDoctors() {
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
            alert('Erro ao carregar médicos. Verifique se o backend está rodando.');
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

            if (editingDoctor) {
                await doctorService.update(editingDoctor.id, cleanedData);
            } else {
                await doctorService.create(cleanedData);
            }
            closeDialog();
            loadDoctors();
        } catch (error) {
            console.error('Error saving doctor:', error);
            alert('Erro ao salvar médico');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (doctor: Doctor) => {
        setEditingDoctor(doctor);
        setFormData({
            name: doctor.name,
            phone: doctor.phone,
            type: doctor.type,
            notes: doctor.notes || '',
            fixedWeekdays: doctor.fixedWeekdays || [],
            fixedShift: doctor.fixedShift,
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar este médico? Isso também removerá todas as locações associadas.')) return;

        try {
            await doctorService.delete(id);
            loadDoctors();
        } catch (error) {
            alert('Erro ao deletar médico');
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
