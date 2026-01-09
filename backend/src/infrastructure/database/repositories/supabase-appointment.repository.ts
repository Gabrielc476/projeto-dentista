import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { SupabaseConfig } from '../supabase.config';

@Injectable()
export class SupabaseAppointmentRepository implements IAppointmentRepository {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = SupabaseConfig.getInstance();
    }

    async create(
        appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>,
        procedureIds: Array<{ id: string; quantity: number; unitPrice?: number }>
    ): Promise<Appointment> {
        const { data: appointmentData, error: appointmentError } = await this.supabase
            .from('appointments')
            .insert([{
                patient_id: appointment.patientId,
                scheduled_date: appointment.scheduledDate,
                status: appointment.status,
                notes: appointment.notes,
                total_value: appointment.totalValue,
            }])
            .select()
            .single();

        if (appointmentError) {
            throw new Error(`Error creating appointment: ${appointmentError.message}`);
        }

        // Insert appointment procedures
        if (procedureIds.length > 0) {
            const appointmentProcedures = procedureIds.map(p => ({
                appointment_id: appointmentData.id,
                procedure_id: p.id,
                quantity: p.quantity,
                unit_price: p.unitPrice,
            }));

            const { error: proceduresError } = await this.supabase
                .from('appointment_procedures')
                .insert(appointmentProcedures);

            if (proceduresError) {
                // Rollback appointment if procedures fail
                await this.supabase.from('appointments').delete().eq('id', appointmentData.id);
                throw new Error(`Error creating appointment procedures: ${proceduresError.message}`);
            }
        }

        return await this.findById(appointmentData.id) as Appointment;
    }

    async findById(id: string): Promise<Appointment | null> {
        const { data, error } = await this.supabase
            .from('appointments')
            .select(`
        *,
        patients (name)
      `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error finding appointment: ${error.message}`);
        }

        // Get procedures
        const { data: proceduresData } = await this.supabase
            .from('appointment_procedures')
            .select(`
        quantity,
        unit_price,
        procedures (id, name)
      `)
            .eq('appointment_id', id);

        const procedimentos = proceduresData?.map(ap => ({
            id: (ap.procedures as any).id,
            name: (ap.procedures as any).name,
            quantity: ap.quantity,
            unitPrice: ap.unit_price,
        })) || [];

        return this.mapToEntity(data, data.patients?.name, procedimentos);
    }

    async findAll(filters?: { patientId?: string; status?: string; date?: Date }): Promise<Appointment[]> {
        let query = this.supabase
            .from('appointments')
            .select(`
        *,
        patients (name)
      `);

        if (filters?.patientId) {
            query = query.eq('patient_id', filters.patientId);
        }

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        if (filters?.date) {
            const startOfDay = new Date(filters.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filters.date);
            endOfDay.setHours(23, 59, 59, 999);

            query = query
                .gte('scheduled_date', startOfDay.toISOString())
                .lte('scheduled_date', endOfDay.toISOString());
        }

        const { data, error } = await query.order('scheduled_date', { ascending: false });

        if (error) {
            throw new Error(`Error finding appointments: ${error.message}`);
        }

        if (!data || data.length === 0) {
            return [];
        }

        // OPTIMIZED: Batch fetch all procedures for all appointments in ONE query
        const appointmentIds = data.map(apt => apt.id);

        const { data: allProceduresData } = await this.supabase
            .from('appointment_procedures')
            .select(`
                appointment_id,
                quantity,
                unit_price,
                procedures (id, name)
            `)
            .in('appointment_id', appointmentIds);

        // Group procedures by appointment_id in memory
        const proceduresByAppointment = new Map<string, any[]>();
        for (const ap of (allProceduresData || [])) {
            const list = proceduresByAppointment.get(ap.appointment_id) || [];
            list.push({
                id: (ap.procedures as any).id,
                name: (ap.procedures as any).name,
                quantity: ap.quantity,
                unitPrice: ap.unit_price,
            });
            proceduresByAppointment.set(ap.appointment_id, list);
        }

        // Map appointments with their procedures
        const appointments = data.map(apt => {
            const procedimentos = proceduresByAppointment.get(apt.id) || [];
            return this.mapToEntity(apt, apt.patients?.name, procedimentos);
        });

        return appointments;
    }

    async update(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
        const { data, error } = await this.supabase
            .from('appointments')
            .update({
                patient_id: appointment.patientId,
                scheduled_date: appointment.scheduledDate,
                status: appointment.status,
                notes: appointment.notes,
                total_value: appointment.totalValue,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Error updating appointment: ${error.message}`);
        }

        return await this.findById(id) as Appointment;
    }

    async delete(id: string): Promise<void> {
        // Delete appointment procedures first (foreign key constraint)
        await this.supabase
            .from('appointment_procedures')
            .delete()
            .eq('appointment_id', id);

        const { error } = await this.supabase
            .from('appointments')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Error deleting appointment: ${error.message}`);
        }
    }

    private mapToEntity(data: any, pacienteNome?: string, procedimentos?: any[]): Appointment {
        return new Appointment({
            id: data.id,
            patientId: data.patient_id,
            scheduledDate: new Date(data.scheduled_date),
            status: data.status,
            notes: data.notes,
            totalValue: data.total_value,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            pacienteNome,
            procedimentos,
        });
    }
}
