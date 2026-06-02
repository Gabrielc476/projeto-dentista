import { Injectable, Inject } from '@nestjs/common';
import type { IProcedureRepository } from '../../../domain/repositories/procedure.repository.interface';
import { Procedure } from '../../../domain/entities/procedure.entity';
import { CreateProcedureDto } from '../../dtos/input/create-procedure.dto';

@Injectable()
export class CreateProcedureUseCase {
    constructor(
        @Inject('IProcedureRepository')
        private readonly procedureRepository: IProcedureRepository,
    ) { }

    async execute(dto: CreateProcedureDto): Promise<Procedure> {
        return await this.procedureRepository.create(dto);
    }
}
