import { api } from '@/lib/api';
import { Procedure, ProcedureFormData } from '@/types';

export interface IProcedureService {
    getAll(): Promise<Procedure[]>;
    getById(id: string): Promise<Procedure>;
    create(data: ProcedureFormData): Promise<Procedure>;
    update(id: string, data: Partial<ProcedureFormData>): Promise<Procedure>;
    delete(id: string): Promise<void>;
}

class ProcedureService implements IProcedureService {
    async getAll(): Promise<Procedure[]> {
        return api.get<Procedure[]>('/api/procedures');
    }

    async getById(id: string): Promise<Procedure> {
        return api.get<Procedure>(`/api/procedures/${id}`);
    }

    async create(data: ProcedureFormData): Promise<Procedure> {
        return api.post<Procedure>('/api/procedures', data);
    }

    async update(id: string, data: Partial<ProcedureFormData>): Promise<Procedure> {
        return api.put<Procedure>(`/api/procedures/${id}`, data);
    }

    async delete(id: string): Promise<void> {
        return api.delete(`/api/procedures/${id}`);
    }
}

export const procedureService = new ProcedureService();
