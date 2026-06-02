import { api } from '@/lib/api';
import { Payment, PaymentFormData } from '@/types';

export interface IPaymentService {
    getAll(filters?: { patientId?: string; appointmentId?: string; status?: string }): Promise<Payment[]>;
    getPending(): Promise<Payment[]>;
    getById(id: string): Promise<Payment>;
    create(data: PaymentFormData): Promise<Payment>;
    update(id: string, data: Partial<PaymentFormData>): Promise<Payment>;
    delete(id: string): Promise<void>;
}

class PaymentService implements IPaymentService {
    async getAll(filters?: { patientId?: string; appointmentId?: string; status?: string }): Promise<Payment[]> {
        const params = new URLSearchParams();
        if (filters?.patientId) params.append('patientId', filters.patientId);
        if (filters?.appointmentId) params.append('appointmentId', filters.appointmentId);
        if (filters?.status) params.append('status', filters.status);

        const queryString = params.toString();
        const endpoint = queryString ? `/api/payments?${queryString}` : '/api/payments';

        return api.get<Payment[]>(endpoint);
    }

    async getPending(): Promise<Payment[]> {
        return api.get<Payment[]>('/api/payments/pending');
    }

    async getById(id: string): Promise<Payment> {
        return api.get<Payment>(`/api/payments/${id}`);
    }

    async create(data: PaymentFormData): Promise<Payment> {
        return api.post<Payment>('/api/payments', data);
    }

    async update(id: string, data: Partial<PaymentFormData>): Promise<Payment> {
        return api.put<Payment>(`/api/payments/${id}`, data);
    }

    async delete(id: string): Promise<void> {
        return api.delete(`/api/payments/${id}`);
    }
}

export const paymentService = new PaymentService();
