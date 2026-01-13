import { api } from '@/lib/api';
import { Doctor, DoctorFormData, DoctorType } from '@/types';

// Interface following SOLID - Single Responsibility
export interface IDoctorService {
    getAll(type?: DoctorType): Promise<Doctor[]>;
    getById(id: string): Promise<Doctor>;
    create(data: DoctorFormData): Promise<Doctor>;
    update(id: string, data: Partial<DoctorFormData>): Promise<Doctor>;
    delete(id: string): Promise<void>;
}

// Concrete implementation
class DoctorService implements IDoctorService {
    async getAll(type?: DoctorType): Promise<Doctor[]> {
        const endpoint = type ? `/api/doctors?type=${type}` : '/api/doctors';
        return api.get<Doctor[]>(endpoint);
    }

    async getById(id: string): Promise<Doctor> {
        return api.get<Doctor>(`/api/doctors/${id}`);
    }

    async create(data: DoctorFormData): Promise<Doctor> {
        return api.post<Doctor>('/api/doctors', data);
    }

    async update(id: string, data: Partial<DoctorFormData>): Promise<Doctor> {
        return api.put<Doctor>(`/api/doctors/${id}`, data);
    }

    async delete(id: string): Promise<void> {
        return api.delete(`/api/doctors/${id}`);
    }
}

export const doctorService = new DoctorService();
