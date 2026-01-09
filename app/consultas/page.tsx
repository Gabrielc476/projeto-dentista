'use client';

import { useAppointments } from '@/hooks/useAppointments';
import { PageHeader } from '@/components/molecules/PageHeader';
import { AppointmentTable } from '@/components/organisms/AppointmentTable';
import { AppointmentFormDialog } from '@/components/organisms/AppointmentFormDialog';

export default function ConsultasPage() {
    const {
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
        addProcedure,
        removeProcedure,
        updateProcedure,
    } = useAppointments();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Consultas"
                description="Gerenciar agendamento de consultas"
                actionLabel="+ Nova Consulta"
                onAction={openDialog}
            />

            <AppointmentTable
                appointments={appointments}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <AppointmentFormDialog
                open={dialogOpen}
                onClose={closeDialog}
                formData={formData}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                isEditing={!!editingAppointment}
                patients={patients}
                procedures={procedures}
                selectedProcedures={selectedProcedures}
                onAddProcedure={addProcedure}
                onRemoveProcedure={removeProcedure}
                onUpdateProcedure={updateProcedure}
            />
        </div>
    );
}
