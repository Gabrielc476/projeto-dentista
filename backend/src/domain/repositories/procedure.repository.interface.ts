import { Procedure } from '../entities/procedure.entity';

export interface IProcedureRepository {
    create(procedure: Omit<Procedure, 'id' | 'createdAt' | 'updatedAt'>): Promise<Procedure>;
    findById(id: string): Promise<Procedure | null>;
    findAll(): Promise<Procedure[]>;
    update(id: string, procedure: Partial<Procedure>): Promise<Procedure>;
    delete(id: string): Promise<void>;
}
