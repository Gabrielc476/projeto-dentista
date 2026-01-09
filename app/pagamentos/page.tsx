'use client';

import { usePayments } from '@/hooks/usePayments';
import { PageHeader } from '@/components/molecules/PageHeader';
import { PaymentTable } from '@/components/organisms/PaymentTable';
import { PaymentFormDialog } from '@/components/organisms/PaymentFormDialog';

export default function PagamentosPage() {
    const {
        payments,
        appointments,
        patients,
        loading,
        dialogOpen,
        formData,
        editingPayment,
        openDialog,
        closeDialog,
        handleFormChange,
        handleSubmit,
        handleEdit,
        handleDelete,
        getPatientName,
    } = usePayments();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Pagamentos"
                description="Controle de pagamentos realizados e pendentes"
                actionLabel="+ Novo Pagamento"
                onAction={openDialog}
            />

            <PaymentTable
                payments={payments}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getPatientName={getPatientName}
            />

            <PaymentFormDialog
                open={dialogOpen}
                onClose={closeDialog}
                formData={formData}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
                isEditing={!!editingPayment}
                patients={patients}
                appointments={appointments}
            />
        </div>
    );
}
