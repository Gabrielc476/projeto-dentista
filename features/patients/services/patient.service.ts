import { api } from '@/lib/api';
import { Patient, PatientFormData } from '@/types';

// Interface following SOLID - Single Responsibility
export interface IPatientService {
    getAll(): Promise<Patient[]>;
    getById(id: string): Promise<Patient>;
    create(data: PatientFormData): Promise<Patient>;
    update(id: string, data: Partial<PatientFormData>): Promise<Patient>;
    delete(id: string): Promise<void>;
}

// Concrete implementation
class PatientService implements IPatientService {
    async getAll(): Promise<Patient[]> {
        return api.get<Patient[]>('/api/patients');
    }

    async getById(id: string): Promise<Patient> {
        return api.get<Patient>(`/api/patients/${id}`);
    }

    async create(data: PatientFormData): Promise<Patient> {
        return api.post<Patient>('/api/patients', data);
    }

    async update(id: string, data: Partial<PatientFormData>): Promise<Patient> {
        return api.put<Patient>(`/api/patients/${id}`, data);
    }

    async delete(id: string): Promise<void> {
        return api.delete(`/api/patients/${id}`);
    }
}

export const patientService = new PatientService();
