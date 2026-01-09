import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuthModule } from './auth/auth.module';
import { CsrfMiddleware } from './auth/middleware/csrf.middleware';

// Controllers
import { PatientController } from './presentation/controllers/patient.controller';
import { ProcedureController } from './presentation/controllers/procedure.controller';
import { AppointmentController } from './presentation/controllers/appointment.controller';
import { PaymentController } from './presentation/controllers/payment.controller';

// Patient Use Cases
import { CreatePatientUseCase } from './application/use-cases/patient/create-patient.usecase';
import { GetPatientUseCase } from './application/use-cases/patient/get-patient.usecase';
import { ListPatientsUseCase } from './application/use-cases/patient/list-patients.usecase';
import { UpdatePatientUseCase } from './application/use-cases/patient/update-patient.usecase';
import { DeletePatientUseCase } from './application/use-cases/patient/delete-patient.usecase';

// Procedure Use Cases
import { CreateProcedureUseCase } from './application/use-cases/procedure/create-procedure.usecase';
import { GetProcedureUseCase } from './application/use-cases/procedure/get-procedure.usecase';
import { ListProceduresUseCase } from './application/use-cases/procedure/list-procedures.usecase';
import { UpdateProcedureUseCase } from './application/use-cases/procedure/update-procedure.usecase';
import { DeleteProcedureUseCase } from './application/use-cases/procedure/delete-procedure.usecase';

// Appointment Use Cases
import { CreateAppointmentUseCase } from './application/use-cases/appointment/create-appointment.usecase';
import { GetAppointmentUseCase } from './application/use-cases/appointment/get-appointment.usecase';
import { ListAppointmentsUseCase } from './application/use-cases/appointment/list-appointments.usecase';
import { UpdateAppointmentUseCase } from './application/use-cases/appointment/update-appointment.usecase';
import { DeleteAppointmentUseCase } from './application/use-cases/appointment/delete-appointment.usecase';

// Payment Use Cases
import { CreatePaymentUseCase } from './application/use-cases/payment/create-payment.usecase';
import { GetPaymentUseCase } from './application/use-cases/payment/get-payment.usecase';
import { ListPaymentsUseCase } from './application/use-cases/payment/list-payments.usecase';
import { ListPendingPaymentsUseCase } from './application/use-cases/payment/list-pending-payments.usecase';
import { UpdatePaymentUseCase } from './application/use-cases/payment/update-payment.usecase';
import { DeletePaymentUseCase } from './application/use-cases/payment/delete-payment.usecase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Rate limiting: 100 requests per 60 seconds per IP
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    InfrastructureModule,
    AuthModule,
  ],
  controllers: [
    PatientController,
    ProcedureController,
    AppointmentController,
    PaymentController,
  ],
  providers: [
    // Patient Use Cases
    CreatePatientUseCase,
    GetPatientUseCase,
    ListPatientsUseCase,
    UpdatePatientUseCase,
    DeletePatientUseCase,
    // Procedure Use Cases
    CreateProcedureUseCase,
    GetProcedureUseCase,
    ListProceduresUseCase,
    UpdateProcedureUseCase,
    DeleteProcedureUseCase,
    // Appointment Use Cases
    CreateAppointmentUseCase,
    GetAppointmentUseCase,
    ListAppointmentsUseCase,
    UpdateAppointmentUseCase,
    DeleteAppointmentUseCase,
    // Payment Use Cases
    CreatePaymentUseCase,
    GetPaymentUseCase,
    ListPaymentsUseCase,
    ListPendingPaymentsUseCase,
    UpdatePaymentUseCase,
    DeletePaymentUseCase,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CsrfMiddleware)
      .forRoutes('*');
  }
}

