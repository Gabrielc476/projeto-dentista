import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { Payment } from '../../../domain/entities/payment.entity';
import { SupabaseConfig } from '../supabase.config';

@Injectable()
export class SupabasePaymentRepository implements IPaymentRepository {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = SupabaseConfig.getInstance();
    }

    async create(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
        const { data, error } = await this.supabase
            .from('payments')
            .insert([{
                appointment_id: payment.appointmentId,
                patient_id: payment.patientId,
                amount: payment.amount,
                payment_type: payment.paymentType,
                payment_date: payment.paymentDate,
                status: payment.status,
                notes: payment.notes,
            }])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating payment: ${error.message}`);
        }

        return this.mapToEntity(data);
    }

    async findById(id: string): Promise<Payment | null> {
        const { data, error } = await this.supabase
            .from('payments')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error finding payment: ${error.message}`);
        }

        return this.mapToEntity(data);
    }

    async findAll(filters?: { patientId?: string; appointmentId?: string; status?: string }): Promise<Payment[]> {
        let query = this.supabase.from('payments').select('*');

        if (filters?.patientId) {
            query = query.eq('patient_id', filters.patientId);
        }

        if (filters?.appointmentId) {
            query = query.eq('appointment_id', filters.appointmentId);
        }

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        const { data, error } = await query.order('payment_date', { ascending: false });

        if (error) {
            throw new Error(`Error finding payments: ${error.message}`);
        }

        return data.map(this.mapToEntity);
    }

    async findPending(): Promise<Payment[]> {
        const { data, error } = await this.supabase
            .from('payments')
            .select('*')
            .eq('status', 'pending')
            .order('payment_date', { ascending: true });

        if (error) {
            throw new Error(`Error finding pending payments: ${error.message}`);
        }

        return data.map(this.mapToEntity);
    }

    async update(id: string, payment: Partial<Payment>): Promise<Payment> {
        const { data, error } = await this.supabase
            .from('payments')
            .update({
                appointment_id: payment.appointmentId,
                patient_id: payment.patientId,
                amount: payment.amount,
                payment_type: payment.paymentType,
                payment_date: payment.paymentDate,
                status: payment.status,
                notes: payment.notes,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Error updating payment: ${error.message}`);
        }

        return this.mapToEntity(data);
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('payments')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Error deleting payment: ${error.message}`);
        }
    }

    private mapToEntity(data: any): Payment {
        return new Payment({
            id: data.id,
            appointmentId: data.appointment_id,
            patientId: data.patient_id,
            amount: data.amount,
            paymentType: data.payment_type,
            paymentDate: new Date(data.payment_date),
            status: data.status,
            notes: data.notes,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        });
    }
}
