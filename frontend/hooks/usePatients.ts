import { useState, useEffect } from 'react';
import { Patient, PatientFormData } from '@/types';
import { patientService } from '@/features/patients/services/patient.service';
import { toast } from 'sonner';
import { useConfirm } from '@/contexts/ConfirmContext';

export function usePatients() {
    const confirm = useConfirm();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false); // Previne duplo clique
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [formData, setFormData] = useState<PatientFormData>({
        name: '',
        phone: '',
        email: '',
        cpf: '',
        address: '',
        notes: '',
    });

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            const data = await patientService.getAll();
            setPatients(data);
        } catch (error) {
            console.error('Error loading patients:', error);
            toast.error('Erro ao carregar pacientes. Verifique se o backend está rodando.');
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

    const handleFormChange = (data: PatientFormData) => {
        setFormData(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Previne duplo clique
        if (submitting) return;
        setSubmitting(true);

        try {
            // Remove empty string fields for optional fields
            const cleanedData = { ...formData };
            if (!cleanedData.email) delete cleanedData.email;
            if (!cleanedData.cpf) delete cleanedData.cpf;
            if (!cleanedData.birthDate) delete cleanedData.birthDate;
            if (!cleanedData.address) delete cleanedData.address;
            if (!cleanedData.notes) delete cleanedData.notes;

            if (editingPatient) {
                await patientService.update(editingPatient.id, cleanedData);
                toast.success('Paciente atualizado com sucesso!');
            } else {
                await patientService.create(cleanedData);
                toast.success('Paciente cadastrado com sucesso!');
            }
            closeDialog();
            loadPatients();
        } catch (error) {
            console.error('Error saving patient:', error);
            toast.error('Erro ao salvar paciente');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (patient: Patient) => {
        setEditingPatient(patient);
        setFormData({
            name: patient.name,
            phone: patient.phone,
            email: patient.email || '',
            cpf: patient.cpf || '',
            address: patient.address || '',
            notes: patient.notes || '',
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        const proceed = await confirm({
            title: 'Deletar Paciente',
            description: 'Tem certeza que deseja deletar este paciente? Esta ação não pode ser desfeita.',
            confirmText: 'Deletar',
            cancelText: 'Cancelar',
            variant: 'destructive'
        });
        if (!proceed) return;

        try {
            await patientService.delete(id);
            toast.success('Paciente removido com sucesso!');
            loadPatients();
        } catch (error) {
            toast.error('Erro ao deletar paciente');
        }
    };

    const resetForm = () => {
        setEditingPatient(null);
        setFormData({
            name: '',
            phone: '',
            email: '',
            cpf: '',
            address: '',
            notes: '',
        });
    };

    return {
        patients,
        loading,
        submitting,
        dialogOpen,
        formData,
        editingPatient,
        openDialog,
        closeDialog,
        handleFormChange,
        handleSubmit,
        handleEdit,
        handleDelete,
    };
}

