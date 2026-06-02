import { Patient } from '../entities/patient.entity';

export interface IPatientRepository {
    create(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient>;
    findById(id: string): Promise<Patient | null>;
    findAll(): Promise<Patient[]>;
    update(id: string, patient: Partial<Patient>): Promise<Patient>;
    delete(id: string): Promise<void>;
}
