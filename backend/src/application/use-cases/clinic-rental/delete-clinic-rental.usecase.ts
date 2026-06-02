import { Injectable, Inject } from '@nestjs/common';
import type { IClinicRentalRepository } from '../../../domain/repositories/clinic-rental.repository.interface';

@Injectable()
export class DeleteClinicRentalUseCase {
    constructor(
        @Inject('IClinicRentalRepository')
        private readonly clinicRentalRepository: IClinicRentalRepository,
    ) { }

    async execute(id: string): Promise<void> {
        return await this.clinicRentalRepository.delete(id);
    }
}
