import { Appointment } from '../entities/appointment.entity';

export interface IAppointmentRepository {
    create(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>, procedureIds: Array<{ id: string; quantity: number; unitPrice?: number }>): Promise<Appointment>;
    findById(id: string): Promise<Appointment | null>;
    findAll(filters?: { patientId?: string; status?: string; date?: Date; startDate?: Date; endDate?: Date }): Promise<Appointment[]>;
    update(id: string, appointment: Partial<Appointment>): Promise<Appointment>;
    delete(id: string): Promise<void>;
}
