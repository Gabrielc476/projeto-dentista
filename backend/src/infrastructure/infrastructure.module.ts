import { Module } from '@nestjs/common';
import { SupabasePatientRepository } from './database/repositories/supabase-patient.repository';
import { SupabaseProcedureRepository } from './database/repositories/supabase-procedure.repository';
import { SupabaseAppointmentRepository } from './database/repositories/supabase-appointment.repository';
import { SupabasePaymentRepository } from './database/repositories/supabase-payment.repository';

@Module({
    providers: [
        {
            provide: 'IPatientRepository',
            useClass: SupabasePatientRepository,
        },
        {
            provide: 'IProcedureRepository',
            useClass: SupabaseProcedureRepository,
        },
        {
            provide: 'IAppointmentRepository',
            useClass: SupabaseAppointmentRepository,
        },
        {
            provide: 'IPaymentRepository',
            useClass: SupabasePaymentRepository,
        },
    ],
    exports: [
        'IPatientRepository',
        'IProcedureRepository',
        'IAppointmentRepository',
        'IPaymentRepository',
    ],
})
export class InfrastructureModule { }
