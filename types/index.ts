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
    paymentStatus?: 'pending' | 'completed' | 'paid';
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

// Doctor types (para locação da clínica)
export type DoctorType = 'fixed' | 'temporary';
export type WeekdayNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEKDAY_NAMES: Record<WeekdayNumber, string> = {
    0: 'Domingo',
    1: 'Segunda',
    2: 'Terça',
    3: 'Quarta',
    4: 'Quinta',
    5: 'Sexta',
    6: 'Sábado',
};

export interface Doctor {
    id: string;
    name: string;
    phone: string;
    type: DoctorType;
    notes?: string;
    // Recurrence for fixed doctors
    fixedWeekdays?: WeekdayNumber[];
    fixedShift?: ShiftType;
    createdAt: Date;
    updatedAt: Date;
}

// ClinicRental types (locação por turno)
export type ShiftType = 'morning' | 'afternoon' | 'evening';

export const SHIFT_LABELS: Record<ShiftType, string> = {
    morning: '08:00 - 12:00',
    afternoon: '14:00 - 18:00',
    evening: '18:00 - 22:00',
};

export const SHIFT_NAMES: Record<ShiftType, string> = {
    morning: 'Manhã',
    afternoon: 'Tarde',
    evening: 'Noite',
};

export interface ClinicRental {
    id: string;
    doctorId: string;
    date: Date | string;
    shift: ShiftType;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    // Computed fields
    doctorName?: string;
    doctorType?: DoctorType;
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

export interface DoctorFormData {
    name: string;
    phone: string;
    type: DoctorType;
    notes?: string;
    fixedWeekdays?: number[];
    fixedShift?: ShiftType;
}

export interface ClinicRentalFormData {
    doctorId: string;
    date: string;
    shift: ShiftType;
    notes?: string;
}

