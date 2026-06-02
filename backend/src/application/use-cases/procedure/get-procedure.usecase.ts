import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IProcedureRepository } from '../../../domain/repositories/procedure.repository.interface';
import { Procedure } from '../../../domain/entities/procedure.entity';

@Injectable()
export class GetProcedureUseCase {
    constructor(
        @Inject('IProcedureRepository')
        private readonly procedureRepository: IProcedureRepository,
    ) { }

    async execute(id: string): Promise<Procedure> {
        const procedure = await this.procedureRepository.findById(id);

        if (!procedure) {
            throw new NotFoundException(`Procedure with ID ${id} not found`);
        }

        return procedure;
    }
}
