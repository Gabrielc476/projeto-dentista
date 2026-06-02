import { Payment } from '../entities/payment.entity';

export interface IPaymentRepository {
    create(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment>;
    findById(id: string): Promise<Payment | null>;
    findAll(filters?: { patientId?: string; appointmentId?: string; status?: string }): Promise<Payment[]>;
    findPending(): Promise<Payment[]>;
    update(id: string, payment: Partial<Payment>): Promise<Payment>;
    delete(id: string): Promise<void>;
}
