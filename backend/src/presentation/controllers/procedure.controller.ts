import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CreateProcedureUseCase } from '../../application/use-cases/procedure/create-procedure.usecase';
import { GetProcedureUseCase } from '../../application/use-cases/procedure/get-procedure.usecase';
import { ListProceduresUseCase } from '../../application/use-cases/procedure/list-procedures.usecase';
import { UpdateProcedureUseCase } from '../../application/use-cases/procedure/update-procedure.usecase';
import { DeleteProcedureUseCase } from '../../application/use-cases/procedure/delete-procedure.usecase';
import { CreateProcedureDto } from '../../application/dtos/input/create-procedure.dto';
import { UpdateProcedureDto } from '../../application/dtos/input/update-procedure.dto';

@Controller('api/procedures')
export class ProcedureController {
    constructor(
        private readonly createProcedureUseCase: CreateProcedureUseCase,
        private readonly getProcedureUseCase: GetProcedureUseCase,
        private readonly listProceduresUseCase: ListProceduresUseCase,
        private readonly updateProcedureUseCase: UpdateProcedureUseCase,
        private readonly deleteProcedureUseCase: DeleteProcedureUseCase,
    ) { }

    @Post()
    async create(@Body() createProcedureDto: CreateProcedureDto) {
        return await this.createProcedureUseCase.execute(createProcedureDto);
    }

    @Get()
    async findAll() {
        return await this.listProceduresUseCase.execute();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.getProcedureUseCase.execute(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateProcedureDto: UpdateProcedureDto) {
        return await this.updateProcedureUseCase.execute(id, updateProcedureDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.deleteProcedureUseCase.execute(id);
    }
}
