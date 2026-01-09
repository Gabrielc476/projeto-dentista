import { api } from '@/lib/api';
import { Appointment, AppointmentFormData } from '@/types';

export interface IAppointmentService {
    getAll(filters?: { patientId?: string; status?: string; date?: string }): Promise<Appointment[]>;
    getById(id: string): Promise<Appointment>;
    create(data: AppointmentFormData): Promise<Appointment>;
    update(id: string, data: Partial<AppointmentFormData>): Promise<Appointment>;
    delete(id: string): Promise<void>;
}

class AppointmentService implements IAppointmentService {
    async getAll(filters?: { patientId?: string; status?: string; date?: string }): Promise<Appointment[]> {
        const params = new URLSearchParams();
        if (filters?.patientId) params.append('patientId', filters.patientId);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.date) params.append('date', filters.date);

        const queryString = params.toString();
        const endpoint = queryString ? `/api/appointments?${queryString}` : '/api/appointments';

        return api.get<Appointment[]>(endpoint);
    }

    async getById(id: string): Promise<Appointment> {
        return api.get<Appointment>(`/api/appointments/${id}`);
    }

    async create(data: AppointmentFormData): Promise<Appointment> {
        return api.post<Appointment>('/api/appointments', data);
    }

    async update(id: string, data: Partial<AppointmentFormData>): Promise<Appointment> {
        return api.put<Appointment>(`/api/appointments/${id}`, data);
    }

    async delete(id: string): Promise<void> {
        return api.delete(`/api/appointments/${id}`);
    }
}

export const appointmentService = new AppointmentService();
