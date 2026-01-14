import { useState, useEffect } from 'react';
import { Payment, PaymentFormData, Appointment, Patient } from '@/types';
import { paymentService } from '@/features/payments/services/payment.service';
import { appointmentService } from '@/features/appointments/services/appointment.service';
import { patientService } from '@/features/patients/services/patient.service';

export function usePayments() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [formData, setFormData] = useState<PaymentFormData>({
        appointmentId: '',
        patientId: '',
        amount: 0,
        paymentType: 'cash',
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        notes: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [paymentsData, appointmentsData, patientsData] = await Promise.all([
                paymentService.getAll(),
                appointmentService.getAll(),
                patientService.getAll(),
            ]);
            setPayments(paymentsData);
            setAppointments(appointmentsData);
            setPatients(patientsData);
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

    const handleFormChange = (data: PaymentFormData) => {
        setFormData(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            // Remove empty string fields for optional fields
            const cleanedData = { ...formData };
            if (!cleanedData.notes) delete cleanedData.notes;

            if (editingPayment) {
                await paymentService.update(editingPayment.id, cleanedData);
            } else {
                await paymentService.create(cleanedData);
            }
            closeDialog();
            loadData();
        } catch (error) {
            console.error('Error saving payment:', error);
            alert('Erro ao salvar pagamento');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (payment: Payment) => {
        setEditingPayment(payment);
        setFormData({
            appointmentId: payment.appointmentId,
            patientId: payment.patientId,
            amount: payment.amount,
            paymentType: payment.paymentType,
            paymentDate: typeof payment.paymentDate === 'string'
                ? payment.paymentDate.split('T')[0]
                : new Date(payment.paymentDate).toISOString().split('T')[0],
            status: payment.status,
            notes: payment.notes || '',
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar este pagamento?')) return;

        try {
            await paymentService.delete(id);
            loadData();
        } catch (error) {
            alert('Erro ao deletar pagamento');
        }
    };

    const resetForm = () => {
        setEditingPayment(null);
        setFormData({
            appointmentId: '',
            patientId: '',
            amount: 0,
            paymentType: 'cash',
            paymentDate: new Date().toISOString().split('T')[0],
            status: 'pending',
            notes: '',
        });
    };

    const getPatientName = (patientId: string) => {
        return patients.find(p => p.id === patientId)?.name || '-';
    };

    return {
        payments,
        appointments,
        patients,
        loading,
        submitting,
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
    };
}
