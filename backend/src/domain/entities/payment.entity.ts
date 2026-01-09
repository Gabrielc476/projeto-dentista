export class Payment {
    id: string;
    appointmentId: string;
    patientId: string;
    amount: number;
    paymentType: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'insurance';
    paymentDate: Date;
    status: 'pending' | 'completed' | 'cancelled';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<Payment>) {
        Object.assign(this, partial);
    }
}
