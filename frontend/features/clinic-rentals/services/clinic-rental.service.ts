import { api } from '@/lib/api';
import { ClinicRental, ClinicRentalFormData } from '@/types';

// Interface following SOLID - Single Responsibility
export interface IClinicRentalService {
    getAll(startDate?: string, endDate?: string, doctorId?: string): Promise<ClinicRental[]>;
    getById(id: string): Promise<ClinicRental>;
    getByWeek(weekStartDate: string): Promise<ClinicRental[]>;
    create(data: ClinicRentalFormData): Promise<ClinicRental>;
    update(id: string, data: Partial<ClinicRentalFormData>): Promise<ClinicRental>;
    delete(id: string): Promise<void>;
}

// Concrete implementation
class ClinicRentalService implements IClinicRentalService {
    async getAll(startDate?: string, endDate?: string, doctorId?: string): Promise<ClinicRental[]> {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (doctorId) params.append('doctorId', doctorId);

        const queryString = params.toString();
        const endpoint = queryString ? `/api/clinic-rentals?${queryString}` : '/api/clinic-rentals';
        return api.get<ClinicRental[]>(endpoint);
    }

    async getById(id: string): Promise<ClinicRental> {
        return api.get<ClinicRental>(`/api/clinic-rentals/${id}`);
    }

    async getByWeek(weekStartDate: string): Promise<ClinicRental[]> {
        // Calculate end of week (7 days from start)
        const start = new Date(weekStartDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);

        return this.getAll(
            start.toISOString().split('T')[0],
            end.toISOString().split('T')[0]
        );
    }

    async create(data: ClinicRentalFormData): Promise<ClinicRental> {
        return api.post<ClinicRental>('/api/clinic-rentals', data);
    }

    async update(id: string, data: Partial<ClinicRentalFormData>): Promise<ClinicRental> {
        return api.put<ClinicRental>(`/api/clinic-rentals/${id}`, data);
    }

    async delete(id: string): Promise<void> {
        return api.delete(`/api/clinic-rentals/${id}`);
    }
}

export const clinicRentalService = new ClinicRentalService();
