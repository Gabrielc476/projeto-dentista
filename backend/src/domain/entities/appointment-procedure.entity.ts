export class AppointmentProcedure {
    id: string;
    appointmentId: string;
    procedureId: string;
    quantity: number;
    unitPrice?: number;
    createdAt: Date;

    constructor(partial: Partial<AppointmentProcedure>) {
        Object.assign(this, partial);
    }
}
