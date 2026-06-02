export class Patient {
  id: string;
  name: string;
  email?: string;
  phone: string;
  cpf?: string;
  birthDate?: Date;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  // Computed fields
  consultasRealizadas?: number;
  proximaConsulta?: {
    id: string;
    scheduledDate: Date;
    status: string;
  };
  pagamentosRealizados?: number;
  pagamentoPendente?: number;

  constructor(partial: Partial<Patient>) {
    Object.assign(this, partial);
  }
}
