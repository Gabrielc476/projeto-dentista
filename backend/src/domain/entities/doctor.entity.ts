export type DoctorType = 'fixed' | 'temporary';
export type ShiftType = 'morning' | 'afternoon' | 'evening';

// 0 = Sunday, 1 = Monday, ..., 6 = Saturday
export type WeekdayNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export class Doctor {
    id: string;
    name: string;
    phone: string;
    type: DoctorType;
    notes?: string;

    // Recurrence fields for fixed doctors
    fixedWeekdays?: WeekdayNumber[]; // Days of week the doctor rents (e.g., [1, 3] = Monday, Wednesday)
    fixedShift?: ShiftType;          // Which shift they always rent

    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<Doctor>) {
        Object.assign(this, partial);
    }
}
