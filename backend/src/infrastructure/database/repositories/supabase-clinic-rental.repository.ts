import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { IClinicRentalRepository } from '../../../domain/repositories/clinic-rental.repository.interface';
import { ClinicRental, ShiftType } from '../../../domain/entities/clinic-rental.entity';
import { SupabaseConfig } from '../supabase.config';

@Injectable()
export class SupabaseClinicRentalRepository implements IClinicRentalRepository {
    private supabase: SupabaseClient;
    private readonly logger = new Logger(SupabaseClinicRentalRepository.name);

    constructor() {
        this.logger.log('Initializing SupabaseClinicRentalRepository');
        try {
            this.supabase = SupabaseConfig.getInstance();
            this.logger.log('Supabase client initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize Supabase client', error.stack);
            throw error;
        }
    }

    async create(rental: Omit<ClinicRental, 'id' | 'createdAt' | 'updatedAt' | 'doctorName' | 'doctorType'>): Promise<ClinicRental> {
        const { data, error } = await this.supabase
            .from('clinic_rentals')
            .insert([{
                doctor_id: rental.doctorId,
                date: rental.date,
                shift: rental.shift,
                notes: rental.notes,
            }])
            .select(`
                *,
                doctors (
                    name,
                    type
                )
            `)
            .single();

        if (error) {
            throw new Error(`Error creating clinic rental: ${error.message}`);
        }

        return this.mapToEntity(data);
    }

    async findById(id: string): Promise<ClinicRental | null> {
        const { data, error } = await this.supabase
            .from('clinic_rentals')
            .select(`
                *,
                doctors (
                    name,
                    type
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error finding clinic rental: ${error.message}`);
        }

        return this.mapToEntity(data);
    }

    async findAll(): Promise<ClinicRental[]> {
        const { data, error } = await this.supabase
            .from('clinic_rentals')
            .select(`
                *,
                doctors (
                    name,
                    type
                )
            `)
            .order('date', { ascending: false });

        if (error) {
            throw new Error(`Error finding clinic rentals: ${error.message}`);
        }

        return (data || []).map(d => this.mapToEntity(d));
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<ClinicRental[]> {
        const { data, error } = await this.supabase
            .from('clinic_rentals')
            .select(`
                *,
                doctors (
                    name,
                    type
                )
            `)
            .gte('date', startDate.toISOString().split('T')[0])
            .lte('date', endDate.toISOString().split('T')[0])
            .order('date', { ascending: true });

        if (error) {
            throw new Error(`Error finding clinic rentals by date range: ${error.message}`);
        }

        return (data || []).map(d => this.mapToEntity(d));
    }

    async findByDoctorId(doctorId: string): Promise<ClinicRental[]> {
        const { data, error } = await this.supabase
            .from('clinic_rentals')
            .select(`
                *,
                doctors (
                    name,
                    type
                )
            `)
            .eq('doctor_id', doctorId)
            .order('date', { ascending: false });

        if (error) {
            throw new Error(`Error finding clinic rentals by doctor: ${error.message}`);
        }

        return (data || []).map(d => this.mapToEntity(d));
    }

    async findByDateAndShift(date: Date, shift: ShiftType): Promise<ClinicRental | null> {
        const { data, error } = await this.supabase
            .from('clinic_rentals')
            .select(`
                *,
                doctors (
                    name,
                    type
                )
            `)
            .eq('date', date.toISOString().split('T')[0])
            .eq('shift', shift)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error finding clinic rental by date and shift: ${error.message}`);
        }

        return this.mapToEntity(data);
    }

    async update(id: string, rental: Partial<ClinicRental>): Promise<ClinicRental> {
        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (rental.doctorId !== undefined) updateData.doctor_id = rental.doctorId;
        if (rental.date !== undefined) updateData.date = rental.date;
        if (rental.shift !== undefined) updateData.shift = rental.shift;
        if (rental.notes !== undefined) updateData.notes = rental.notes;

        const { data, error } = await this.supabase
            .from('clinic_rentals')
            .update(updateData)
            .eq('id', id)
            .select(`
                *,
                doctors (
                    name,
                    type
                )
            `)
            .single();

        if (error) {
            throw new Error(`Error updating clinic rental: ${error.message}`);
        }

        return this.mapToEntity(data);
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('clinic_rentals')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Error deleting clinic rental: ${error.message}`);
        }
    }

    private mapToEntity(data: any): ClinicRental {
        return new ClinicRental({
            id: data.id,
            doctorId: data.doctor_id,
            date: new Date(data.date),
            shift: data.shift,
            notes: data.notes,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            doctorName: data.doctors?.name,
            doctorType: data.doctors?.type,
        });
    }
}
