'use client';

import { useProcedures } from '@/hooks/useProcedures';
import { PageHeader } from '@/components/molecules/PageHeader';
import { ProcedureTable } from '@/components/organisms/ProcedureTable';
import { ProcedureFormDialog } from '@/components/organisms/ProcedureFormDialog';

export default function ProcedimentosPage() {
    const {
        procedures,
        loading,
        dialogOpen,
        formData,
        editingProcedure,
        openDialog,
        closeDialog,
        handleFormChange,
        handleSubmit,
        handleEdit,
        handleDelete,
    } = useProcedures();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Procedimentos"
                description="Catálogo de procedimentos odontológicos"
                actionLabel="+ Novo Procedimento"
                onAction={openDialog}
            />

            <ProcedureTable
                procedures={procedures}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ProcedureFormDialog
                open={dialogOpen}
                onClose={closeDialog}
                formData={formData}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
                isEditing={!!editingProcedure}
            />
        </div>
    );
}
