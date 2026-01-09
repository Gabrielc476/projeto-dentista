import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { IProcedureRepository } from '../../../domain/repositories/procedure.repository.interface';
import { Procedure } from '../../../domain/entities/procedure.entity';
import { SupabaseConfig } from '../supabase.config';

@Injectable()
export class SupabaseProcedureRepository implements IProcedureRepository {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = SupabaseConfig.getInstance();
    }

    async create(procedure: Omit<Procedure, 'id' | 'createdAt' | 'updatedAt'>): Promise<Procedure> {
        const { data, error } = await this.supabase
            .from('procedures')
            .insert([{
                name: procedure.name,
                description: procedure.description,
                default_price: procedure.defaultPrice,
                duration_minutes: procedure.durationMinutes,
            }])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating procedure: ${error.message}`);
        }

        return this.mapToEntity(data);
    }

    async findById(id: string): Promise<Procedure | null> {
        const { data, error } = await this.supabase
            .from('procedures')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error finding procedure: ${error.message}`);
        }

        return this.mapToEntity(data);
    }

    async findAll(): Promise<Procedure[]> {
        const { data, error } = await this.supabase
            .from('procedures')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            throw new Error(`Error finding procedures: ${error.message}`);
        }

        return data.map(this.mapToEntity);
    }

    async update(id: string, procedure: Partial<Procedure>): Promise<Procedure> {
        const { data, error } = await this.supabase
            .from('procedures')
            .update({
                name: procedure.name,
                description: procedure.description,
                default_price: procedure.defaultPrice,
                duration_minutes: procedure.durationMinutes,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Error updating procedure: ${error.message}`);
        }

        return this.mapToEntity(data);
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('procedures')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Error deleting procedure: ${error.message}`);
        }
    }

    private mapToEntity(data: any): Procedure {
        return new Procedure({
            id: data.id,
            name: data.name,
            description: data.description,
            defaultPrice: data.default_price,
            durationMinutes: data.duration_minutes,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        });
    }
}
