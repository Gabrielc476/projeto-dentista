import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IProcedureRepository } from '../../../domain/repositories/procedure.repository.interface';

@Injectable()
export class DeleteProcedureUseCase {
    constructor(
        @Inject('IProcedureRepository')
        private readonly procedureRepository: IProcedureRepository,
    ) { }

    async execute(id: string): Promise<void> {
        const procedure = await this.procedureRepository.findById(id);

        if (!procedure) {
            throw new NotFoundException(`Procedure with ID ${id} not found`);
        }

        await this.procedureRepository.delete(id);
    }
}
