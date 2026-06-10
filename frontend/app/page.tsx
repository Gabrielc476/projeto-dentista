'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { StatCard } from '@/components/molecules/StatCard';
import { NextAppointmentCard } from '@/components/organisms/NextAppointmentCard';
import { UpcomingAppointmentsTable } from '@/components/organisms/UpcomingAppointmentsTable';
import { LoadingState } from '@/components/molecules/LoadingState';
import { useRouter } from 'next/navigation';
import {
  Users,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  UserPlus,
  CalendarPlus,
  Activity,
  CreditCard
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { loading, kpis, nextAppointment, upcomingAppointments } = useDashboard();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo ao DentistFlow
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total de Pacientes"
          value={kpis.totalPatients}
          iconColor="bg-blue-500/10 text-blue-500 dark:text-blue-400"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Consultas Hoje"
          value={kpis.todayAppointments}
          iconColor="bg-teal-500/10 text-teal-500 dark:text-teal-400"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Procedimentos Concluídos"
          value={kpis.completedProcedures}
          iconColor="bg-green-500/10 text-green-500 dark:text-green-400"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Pagamentos Pendentes"
          value={kpis.pendingPayments}
          iconColor="bg-amber-500/10 text-amber-500 dark:text-amber-400"
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Receita Mensal"
          value={`R$ ${kpis.monthlyRevenue.toFixed(0)}`}
          iconColor="bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
          trend="Este mês"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Appointment - Takes 1 column */}
        <div className="lg:col-span-1">
          <NextAppointmentCard
            appointment={nextAppointment}
            onViewDetails={() => {
              if (nextAppointment) {
                router.push(`/consultas/${nextAppointment.id}`);
              }
            }}
          />
        </div>

        {/* Upcoming Appointments Table - Takes 2 columns */}
        <div className="lg:col-span-2">
          <UpcomingAppointmentsTable appointments={upcomingAppointments} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => router.push('/pacientes')}
          className="p-6 glass-card rounded-xl text-left border border-border hover:border-primary/50 transition-all duration-300 group cursor-pointer"
        >
          <div className="icon-circle bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <UserPlus className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-foreground">Novo Paciente</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Cadastrar novo paciente
          </p>
        </button>

        <button
          onClick={() => router.push('/consultas')}
          className="p-6 glass-card rounded-xl text-left border border-border hover:border-primary/50 transition-all duration-300 group cursor-pointer"
        >
          <div className="icon-circle bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <CalendarPlus className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-foreground">Agendar Consulta</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Nova consulta
          </p>
        </button>

        <button
          onClick={() => router.push('/procedimentos')}
          className="p-6 glass-card rounded-xl text-left border border-border hover:border-primary/50 transition-all duration-300 group cursor-pointer"
        >
          <div className="icon-circle bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-foreground">Procedimentos</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Gerenciar procedimentos
          </p>
        </button>

        <button
          onClick={() => router.push('/pagamentos')}
          className="p-6 glass-card rounded-xl text-left border border-border hover:border-primary/50 transition-all duration-300 group cursor-pointer"
        >
          <div className="icon-circle bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-foreground">Pagamentos</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Registrar pagamento
          </p>
        </button>
      </div>
    </div>
  );
}

