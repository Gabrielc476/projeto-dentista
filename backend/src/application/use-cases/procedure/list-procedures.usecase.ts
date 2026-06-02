import { Injectable, Inject } from '@nestjs/common';
import type { IProcedureRepository } from '../../../domain/repositories/procedure.repository.interface';
import { Procedure } from '../../../domain/entities/procedure.entity';

@Injectable()
export class ListProceduresUseCase {
    constructor(
        @Inject('IProcedureRepository')
        private readonly procedureRepository: IProcedureRepository,
    ) { }

    async execute(): Promise<Procedure[]> {
        return await this.procedureRepository.findAll();
    }
}
