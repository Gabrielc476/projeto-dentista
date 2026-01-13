export type ShiftType = 'morning' | 'afternoon' | 'evening';

export const SHIFT_LABELS: Record<ShiftType, string> = {
    morning: '08:00 - 12:00',
    afternoon: '14:00 - 18:00',
    evening: '18:00 - 22:00',
};

export class ClinicRental {
    id: string;
    doctorId: string;
    date: Date;
    shift: ShiftType;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;

    // Computed field
    doctorName?: string;
    doctorType?: 'fixed' | 'temporary';

    constructor(partial: Partial<ClinicRental>) {
        Object.assign(this, partial);
    }
}
