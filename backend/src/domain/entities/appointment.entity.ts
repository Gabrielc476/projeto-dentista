export class Appointment {
    id: string;
    patientId: string;
    scheduledDate: Date;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
    paymentStatus?: 'pending' | 'completed';
    notes?: string;
    totalValue?: number;
    createdAt: Date;
    updatedAt: Date;

    // Computed fields
    pacienteNome?: string;
    procedimentos?: Array<{
        id: string;
        name: string;
        quantity: number;
        unitPrice: number;
    }>;

    constructor(partial: Partial<Appointment>) {
        Object.assign(this, partial);
    }
}
