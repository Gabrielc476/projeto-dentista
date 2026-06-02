import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { IPatientRepository } from '../../../domain/repositories/patient.repository.interface';
import { Patient } from '../../../domain/entities/patient.entity';
import { SupabaseConfig } from '../supabase.config';

@Injectable()
export class SupabasePatientRepository implements IPatientRepository {
    private supabase: SupabaseClient;
    private readonly logger = new Logger(SupabasePatientRepository.name);

    constructor() {
        this.logger.log('Initializing SupabasePatientRepository');
        try {
            this.supabase = SupabaseConfig.getInstance();
            this.logger.log('Supabase client initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize Supabase client', error.stack);
            throw error;
        }
    }

    async create(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
        const { data, error } = await this.supabase
            .from('patients')
            .insert([{
                name: patient.name,
                email: patient.email,
                phone: patient.phone,
                cpf: patient.cpf,
                birth_date: patient.birthDate,
                address: patient.address,
                notes: patient.notes,
            }])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating patient: ${error.message}`);
        }

        return this.mapToEntity(data);
    }

    async findById(id: string): Promise<Patient | null> {
        const { data, error } = await this.supabase
            .from('patients')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error finding patient: ${error.message}`);
        }

        // Get computed fields
        const consultasRealizadas = await this.getCompletedAppointmentsCount(id);
        const proximaConsulta = await this.getNextAppointment(id);
        const { pagamentosRealizados, pagamentoPendente } = await this.getPaymentsSummary(id);

        return this.mapToEntity(data, consultasRealizadas, proximaConsulta, pagamentosRealizados, pagamentoPendente);
    }

    async findAll(): Promise<Patient[]> {
        this.logger.log('findAll - Starting to fetch all patients (OPTIMIZED)');
        const startTime = Date.now();

        try {
            // Step 1: Fetch all patients in a single query
            const { data: patientsData, error: patientsError } = await this.supabase
                .from('patients')
                .select('*')
                .order('created_at', { ascending: false });

            if (patientsError) {
                this.logger.error(`findAll - Supabase error: ${patientsError.message}`, patientsError);
                throw new Error(`Error finding patients: ${patientsError.message}`);
            }

            if (!patientsData || patientsData.length === 0) {
                this.logger.log('findAll - No patients found');
                return [];
            }

            const patientIds = patientsData.map(p => p.id);
            this.logger.log(`findAll - Found ${patientsData.length} patients, fetching related data...`);

            // Step 2: Batch fetch all appointments for these patients (single query)
            const { data: appointmentsData } = await this.supabase
                .from('appointments')
                .select('id, patient_id, scheduled_date, status')
                .in('patient_id', patientIds);

            // Step 3: Batch fetch all payments for these patients (single query)
            const { data: paymentsData } = await this.supabase
                .from('payments')
                .select('patient_id, amount, status')
                .in('patient_id', patientIds);

            this.logger.log(`findAll - Fetched ${appointmentsData?.length || 0} appointments and ${paymentsData?.length || 0} payments`);

            // Step 4: Process data in memory (no network calls!)
            const now = new Date();

            // Pre-compute aggregations per patient
            const appointmentsByPatient = new Map<string, typeof appointmentsData>();
            const paymentsByPatient = new Map<string, typeof paymentsData>();

            // Group appointments by patient_id
            for (const apt of (appointmentsData || [])) {
                const list = appointmentsByPatient.get(apt.patient_id) || [];
                list.push(apt);
                appointmentsByPatient.set(apt.patient_id, list);
            }

            // Group payments by patient_id
            for (const payment of (paymentsData || [])) {
                const list = paymentsByPatient.get(payment.patient_id) || [];
                list.push(payment);
                paymentsByPatient.set(payment.patient_id, list);
            }

            // Map patients with computed fields
            const patients = patientsData.map(p => {
                const patientAppointments = appointmentsByPatient.get(p.id) || [];
                const patientPayments = paymentsByPatient.get(p.id) || [];

                // Calculate completed appointments count
                const consultasRealizadas = patientAppointments.filter(
                    apt => apt.status === 'completed'
                ).length;

                // Find next scheduled appointment
                const upcomingAppointments = patientAppointments
                    .filter(apt => apt.status === 'scheduled' && new Date(apt.scheduled_date) > now)
                    .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());

                const proximaConsulta = upcomingAppointments.length > 0 ? {
                    id: upcomingAppointments[0].id,
                    scheduledDate: new Date(upcomingAppointments[0].scheduled_date),
                    status: upcomingAppointments[0].status,
                } : undefined;

                // Calculate payment summaries
                const pagamentosRealizados = patientPayments
                    .filter(p => p.status === 'completed')
                    .reduce((sum, p) => sum + (p.amount || 0), 0);

                const pagamentoPendente = patientPayments
                    .filter(p => p.status === 'pending')
                    .reduce((sum, p) => sum + (p.amount || 0), 0);

                return this.mapToEntity(p, consultasRealizadas, proximaConsulta, pagamentosRealizados, pagamentoPendente);
            });

            const elapsed = Date.now() - startTime;
            this.logger.log(`findAll - Successfully processed ${patients.length} patients in ${elapsed}ms (OPTIMIZED)`);
            return patients;
        } catch (error) {
            this.logger.error('findAll - Fatal error in findAll', error.stack);
            throw error;
        }
    }

    async update(id: string, patient: Partial<Patient>): Promise<Patient> {
        const { data, error } = await this.supabase
            .from('patients')
            .update({
                name: patient.name,
                email: patient.email,
                phone: patient.phone,
                cpf: patient.cpf,
                birth_date: patient.birthDate,
                address: patient.address,
                notes: patient.notes,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Error updating patient: ${error.message}`);
        }

        return this.mapToEntity(data);
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('patients')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Error deleting patient: ${error.message}`);
        }
    }

    private async getCompletedAppointmentsCount(patientId: string): Promise<number> {
        const { count, error } = await this.supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', patientId)
            .eq('status', 'completed');

        if (error) {
            console.error(`Error getting completed appointments count: ${error.message}`);
            return 0;
        }

        return count || 0;
    }

    private async getNextAppointment(patientId: string): Promise<{ id: string; scheduledDate: Date; status: string } | undefined> {
        const { data, error } = await this.supabase
            .from('appointments')
            .select('id, scheduled_date, status')
            .eq('patient_id', patientId)
            .eq('status', 'scheduled')
            .gte('scheduled_date', new Date().toISOString())
            .order('scheduled_date', { ascending: true })
            .limit(1)
            .single();

        if (error || !data) {
            return undefined;
        }

        return {
            id: data.id,
            scheduledDate: new Date(data.scheduled_date),
            status: data.status,
        };
    }

    private async getPaymentsSummary(patientId: string): Promise<{ pagamentosRealizados: number; pagamentoPendente: number }> {
        const { data: completedPayments } = await this.supabase
            .from('payments')
            .select('amount')
            .eq('patient_id', patientId)
            .eq('status', 'completed');

        const { data: pendingPayments } = await this.supabase
            .from('payments')
            .select('amount')
            .eq('patient_id', patientId)
            .eq('status', 'pending');

        const pagamentosRealizados = completedPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        const pagamentoPendente = pendingPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

        return { pagamentosRealizados, pagamentoPendente };
    }

    private mapToEntity(
        data: any,
        consultasRealizadas?: number,
        proximaConsulta?: { id: string; scheduledDate: Date; status: string },
        pagamentosRealizados?: number,
        pagamentoPendente?: number
    ): Patient {
        return new Patient({
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            cpf: data.cpf,
            birthDate: data.birth_date ? new Date(data.birth_date) : undefined,
            address: data.address,
            notes: data.notes,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            consultasRealizadas,
            proximaConsulta,
            pagamentosRealizados,
            pagamentoPendente,
        });
    }
}
