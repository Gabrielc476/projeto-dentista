export class Procedure {
    id: string;
    name: string;
    description?: string;
    defaultPrice?: number;
    durationMinutes?: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<Procedure>) {
        Object.assign(this, partial);
    }
}
