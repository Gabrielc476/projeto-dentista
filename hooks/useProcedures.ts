import { useState, useEffect } from 'react';
import { Procedure, ProcedureFormData } from '@/types';
import { procedureService } from '@/features/procedures/services/procedure.service';

export function useProcedures() {
    const [procedures, setProcedures] = useState<Procedure[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
    const [formData, setFormData] = useState<ProcedureFormData>({
        name: '',
        description: '',
        defaultPrice: undefined,
        durationMinutes: undefined,
    });

    useEffect(() => {
        loadProcedures();
    }, []);

    const loadProcedures = async () => {
        try {
            const data = await procedureService.getAll();
            setProcedures(data);
        } catch (error) {
            console.error('Error loading procedures:', error);
            alert('Erro ao carregar procedimentos. Verifique se o backend está rodando.');
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

    const handleFormChange = (data: ProcedureFormData) => {
        setFormData(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            // Remove empty string fields for optional fields
            const cleanedData = { ...formData };
            if (!cleanedData.description) delete cleanedData.description;
            if (!cleanedData.defaultPrice) delete cleanedData.defaultPrice;
            if (!cleanedData.durationMinutes) delete cleanedData.durationMinutes;

            if (editingProcedure) {
                await procedureService.update(editingProcedure.id, cleanedData);
            } else {
                await procedureService.create(cleanedData);
            }
            closeDialog();
            loadProcedures();
        } catch (error) {
            console.error('Error saving procedure:', error);
            alert('Erro ao salvar procedimento');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (procedure: Procedure) => {
        setEditingProcedure(procedure);
        setFormData({
            name: procedure.name,
            description: procedure.description || '',
            defaultPrice: procedure.defaultPrice,
            durationMinutes: procedure.durationMinutes,
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar este procedimento?')) return;

        try {
            await procedureService.delete(id);
            loadProcedures();
        } catch (error) {
            alert('Erro ao deletar procedimento');
        }
    };

    const resetForm = () => {
        setEditingProcedure(null);
        setFormData({
            name: '',
            description: '',
            defaultPrice: undefined,
            durationMinutes: undefined,
        });
    };

    return {
        procedures,
        loading,
        submitting,
        dialogOpen,
        formData,
        editingProcedure,
        openDialog,
        closeDialog,
        handleFormChange,
        handleSubmit,
        handleEdit,
        handleDelete,
    };
}
