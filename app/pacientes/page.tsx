'use client';

import { usePatients } from '@/hooks/usePatients';
import { PageHeader } from '@/components/molecules/PageHeader';
import { PatientTable } from '@/components/organisms/PatientTable';
import { PatientFormDialog } from '@/components/organisms/PatientFormDialog';

export default function PacientesPage() {
    const {
        patients,
        loading,
        dialogOpen,
        formData,
        editingPatient,
        openDialog,
        closeDialog,
        handleFormChange,
        handleSubmit,
        handleEdit,
        handleDelete,
    } = usePatients();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Pacientes"
                description="Gerenciar cadastro de pacientes"
                actionLabel="+ Novo Paciente"
                onAction={openDialog}
            />

            <PatientTable
                patients={patients}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <PatientFormDialog
                open={dialogOpen}
                onClose={closeDialog}
                formData={formData}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
                isEditing={!!editingPatient}
            />
        </div>
    );
}
