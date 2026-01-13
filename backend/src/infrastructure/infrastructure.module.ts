import { Module } from '@nestjs/common';
import { SupabasePatientRepository } from './database/repositories/supabase-patient.repository';
import { SupabaseProcedureRepository } from './database/repositories/supabase-procedure.repository';
import { SupabaseAppointmentRepository } from './database/repositories/supabase-appointment.repository';
import { SupabasePaymentRepository } from './database/repositories/supabase-payment.repository';
import { SupabaseDoctorRepository } from './database/repositories/supabase-doctor.repository';
import { SupabaseClinicRentalRepository } from './database/repositories/supabase-clinic-rental.repository';

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
        {
            provide: 'IDoctorRepository',
            useClass: SupabaseDoctorRepository,
        },
        {
            provide: 'IClinicRentalRepository',
            useClass: SupabaseClinicRentalRepository,
        },
    ],
    exports: [
        'IPatientRepository',
        'IProcedureRepository',
        'IAppointmentRepository',
        'IPaymentRepository',
        'IDoctorRepository',
        'IClinicRentalRepository',
    ],
})
export class InfrastructureModule { }

