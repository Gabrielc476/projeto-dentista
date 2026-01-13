import { Doctor } from '../entities/doctor.entity';

export interface IDoctorRepository {
    create(doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor>;
    findById(id: string): Promise<Doctor | null>;
    findAll(): Promise<Doctor[]>;
    findByType(type: 'fixed' | 'temporary'): Promise<Doctor[]>;
    update(id: string, doctor: Partial<Doctor>): Promise<Doctor>;
    delete(id: string): Promise<void>;
}
