import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { IDoctorRepository } from '../../../domain/repositories/doctor.repository.interface';
import { Doctor } from '../../../domain/entities/doctor.entity';
import { SupabaseConfig } from '../supabase.config';

@Injectable()
export class SupabaseDoctorRepository implements IDoctorRepository {
    private supabase: SupabaseClient;
    private readonly logger = new Logger(SupabaseDoctorRepository.name);

    constructor() {
        this.logger.log('Initializing SupabaseDoctorRepository');
        try {
            this.supabase = SupabaseConfig.getInstance();
            this.logger.log('Supabase client initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize Supabase client', error.stack);
            throw error;
        }
    }

    async create(doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor> {
        const startDateStr = doctor.fixedStartDate instanceof Date
            ? `${doctor.fixedStartDate.getFullYear()}-${String(doctor.fixedStartDate.getMonth() + 1).padStart(2, '0')}-${String(doctor.fixedStartDate.getDate()).padStart(2, '0')}`
            : doctor.fixedStartDate;

        const endDateStr = doctor.fixedEndDate instanceof Date
            ? `${doctor.fixedEndDate.getFullYear()}-${String(doctor.fixedEndDate.getMonth() + 1).padStart(2, '0')}-${String(doctor.fixedEndDate.getDate()).padStart(2, '0')}`
            : doctor.fixedEndDate;

        const { data, error } = await this.supabase
            .from('doctors')
            .insert([{
                name: doctor.name,
                phone: doctor.phone,
                type: doctor.type,
                notes: doctor.notes,
                fixed_weekdays: doctor.fixedWeekdays,
                fixed_shift: doctor.fixedShift,
                fixed_start_date: startDateStr,
                fixed_end_date: endDateStr,
            }])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating doctor: ${error.message}`);
        }

        return this.mapToEntity(data);
    }

    async findById(id: string): Promise<Doctor | null> {
        const { data, error } = await this.supabase
            .from('doctors')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error finding doctor: ${error.message}`);
        }

        return this.mapToEntity(data);
    }

    async findAll(): Promise<Doctor[]> {
        const { data, error } = await this.supabase
            .from('doctors')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            throw new Error(`Error finding doctors: ${error.message}`);
        }

        return (data || []).map(d => this.mapToEntity(d));
    }

    async findByType(type: 'fixed' | 'temporary'): Promise<Doctor[]> {
        const { data, error } = await this.supabase
            .from('doctors')
            .select('*')
            .eq('type', type)
            .order('name', { ascending: true });

        if (error) {
            throw new Error(`Error finding doctors by type: ${error.message}`);
        }

        return (data || []).map(d => this.mapToEntity(d));
    }

    async update(id: string, doctor: Partial<Doctor>): Promise<Doctor> {
        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (doctor.name !== undefined) updateData.name = doctor.name;
        if (doctor.phone !== undefined) updateData.phone = doctor.phone;
        if (doctor.type !== undefined) updateData.type = doctor.type;
        if (doctor.notes !== undefined) updateData.notes = doctor.notes;
        if (doctor.fixedWeekdays !== undefined) updateData.fixed_weekdays = doctor.fixedWeekdays;
        if (doctor.fixedShift !== undefined) updateData.fixed_shift = doctor.fixedShift;
        
        if (doctor.fixedStartDate !== undefined) {
            updateData.fixed_start_date = doctor.fixedStartDate instanceof Date
                ? `${doctor.fixedStartDate.getFullYear()}-${String(doctor.fixedStartDate.getMonth() + 1).padStart(2, '0')}-${String(doctor.fixedStartDate.getDate()).padStart(2, '0')}`
                : doctor.fixedStartDate;
        }
        if (doctor.fixedEndDate !== undefined) {
            updateData.fixed_end_date = doctor.fixedEndDate instanceof Date
                ? `${doctor.fixedEndDate.getFullYear()}-${String(doctor.fixedEndDate.getMonth() + 1).padStart(2, '0')}-${String(doctor.fixedEndDate.getDate()).padStart(2, '0')}`
                : doctor.fixedEndDate;
        }

        const { data, error } = await this.supabase
            .from('doctors')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Error updating doctor: ${error.message}`);
        }

        return this.mapToEntity(data);
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('doctors')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Error deleting doctor: ${error.message}`);
        }
    }

    private mapToEntity(data: any): Doctor {
        return new Doctor({
            id: data.id,
            name: data.name,
            phone: data.phone,
            type: data.type,
            notes: data.notes,
            fixedWeekdays: data.fixed_weekdays,
            fixedShift: data.fixed_shift,
            fixedStartDate: data.fixed_start_date ? new Date(data.fixed_start_date) : undefined,
            fixedEndDate: data.fixed_end_date ? new Date(data.fixed_end_date) : undefined,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        });
    }
}
