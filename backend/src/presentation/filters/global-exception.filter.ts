import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Ocorreu um erro interno no servidor.';
        let error = 'Internal Server Error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const resBody: any = exception.getResponse();
            message = typeof resBody === 'object' && resBody.message ? resBody.message : exception.message;
            error = typeof resBody === 'object' && resBody.error ? resBody.error : 'HTTP Error';
        } else if (exception instanceof Error) {
            const msg = exception.message;
            this.logger.error(`Exception capturada pelo filtro global: ${msg}`, exception.stack);

            // 1. Erros de chave estrangeira (Foreign Key Constraint Violations)
            if (msg.includes('violates foreign key constraint')) {
                status = HttpStatus.CONFLICT;
                error = 'Conflict';

                if (msg.includes('clinic_rentals')) {
                    message = 'Não é possível excluir o médico porque ele possui locações (reservas) ativas no consultório. Para excluí-lo, primeiro remova ou reagende as locações associadas a ele.';
                } else if (msg.includes('appointments_patient_id_fkey') || (msg.includes('appointments') && msg.includes('patient_id'))) {
                    message = 'Não é possível excluir o paciente porque ele possui consultas agendadas ou registradas. Remova ou cancele as consultas deste paciente antes de excluí-lo.';
                } else if (msg.includes('appointment_procedures')) {
                    message = 'Não é possível excluir o procedimento porque ele está sendo utilizado em consultas. Remova o procedimento das consultas associadas antes de excluí-lo.';
                } else if (msg.includes('payments')) {
                    message = 'Não é possível excluir este registro porque existem pagamentos vinculados a ele. Remova os pagamentos associados antes de prosseguir.';
                } else {
                    message = 'Não é possível excluir este registro porque existem outros dados vinculados a ele. Remova as dependências antes de prosseguir.';
                }
            }
            // 2. Erros de unicidade (Unique Constraint Violations)
            else if (msg.includes('unique constraint') || msg.includes('duplicate key value') || msg.includes('already exists')) {
                status = HttpStatus.BAD_REQUEST;
                error = 'Bad Request';

                if (msg.includes('patients_cpf') || msg.includes('cpf')) {
                    message = 'Já existe um paciente cadastrado com este CPF. Verifique se o paciente já está cadastrado ou corrija o número.';
                } else if (msg.includes('clinic_rentals_date_shift_key') || (msg.includes('clinic_rentals') && msg.includes('shift'))) {
                    message = 'O consultório já está alugado para este turno nesta data. Escolha outro turno ou outra data.';
                } else {
                    message = 'Já existe um registro com os mesmos dados únicos no sistema.';
                }
            }
            // 3. Fallback para outros erros normais
            else {
                message = exception.message || 'Ocorreu um erro interno no servidor.';
            }
        }

        // Formata a mensagem para sempre ser retornada em um array, mantendo compatibilidade com os DTOs do class-validator
        const formattedMessage = Array.isArray(message) ? message : [message];

        response.status(status).json({
            statusCode: status,
            message: formattedMessage,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
