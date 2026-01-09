// Patient types
export interface Patient {
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
}

// Appointment types
export interface Appointment {
    id: string;
    patientId: string;
    scheduledDate: Date | string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
    notes?: string;
    totalValue?: number;
    createdAt: Date;
    updatedAt: Date;
    // Computed fields
    pacienteNome?: string;
    procedimentos?: ProcedureItem[];
}

export interface ProcedureItem {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
}

// Procedure types
export interface Procedure {
    id: string;
    name: string;
    description?: string;
    defaultPrice?: number;
    durationMinutes?: number;
    createdAt: Date;
    updatedAt: Date;
}

// Payment types  
export interface Payment {
    id: string;
    appointmentId: string;
    patientId: string;
    amount: number;
    paymentType: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'insurance';
    paymentDate: Date | string;
    status: 'pending' | 'completed' | 'cancelled';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Form types
export interface PatientFormData {
    name: string;
    email?: string;
    phone: string;
    cpf?: string;
    birthDate?: string;
    address?: string;
    notes?: string;
}

export interface AppointmentFormData {
    patientId: string;
    scheduledDate: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
    notes?: string;
    totalValue?: number;
    procedures: Array<{
        id: string;
        quantity: number;
        unitPrice?: number;
    }>;
}

export interface ProcedureFormData {
    name: string;
    description?: string;
    defaultPrice?: number;
    durationMinutes?: number;
}

export interface PaymentFormData {
    appointmentId: string;
    patientId: string;
    amount: number;
    paymentType: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'insurance';
    paymentDate: string;
    status: 'pending' | 'completed' | 'cancelled';
    notes?: string;
}
