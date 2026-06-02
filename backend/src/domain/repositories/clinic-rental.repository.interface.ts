import { ClinicRental, ShiftType } from '../entities/clinic-rental.entity';

export interface IClinicRentalRepository {
    create(rental: Omit<ClinicRental, 'id' | 'createdAt' | 'updatedAt' | 'doctorName' | 'doctorType'>): Promise<ClinicRental>;
    findById(id: string): Promise<ClinicRental | null>;
    findAll(): Promise<ClinicRental[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<ClinicRental[]>;
    findByDoctorId(doctorId: string): Promise<ClinicRental[]>;
    findByDateAndShift(date: Date, shift: ShiftType): Promise<ClinicRental | null>;
    update(id: string, rental: Partial<ClinicRental>): Promise<ClinicRental>;
    delete(id: string): Promise<void>;
}
