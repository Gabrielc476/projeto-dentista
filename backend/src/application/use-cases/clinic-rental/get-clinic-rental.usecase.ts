import { Injectable, Inject } from '@nestjs/common';
import type { IClinicRentalRepository } from '../../../domain/repositories/clinic-rental.repository.interface';
import { ClinicRental } from '../../../domain/entities/clinic-rental.entity';

@Injectable()
export class GetClinicRentalUseCase {
    constructor(
        @Inject('IClinicRentalRepository')
        private readonly clinicRentalRepository: IClinicRentalRepository,
    ) { }

    async execute(id: string): Promise<ClinicRental | null> {
        return await this.clinicRentalRepository.findById(id);
    }
}
