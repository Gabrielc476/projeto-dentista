'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { StatCard } from '@/components/molecules/StatCard';
import { NextAppointmentCard } from '@/components/organisms/NextAppointmentCard';
import { UpcomingAppointmentsTable } from '@/components/organisms/UpcomingAppointmentsTable';
import { LoadingState } from '@/components/molecules/LoadingState';
import { useRouter } from 'next/navigation';

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
          icon="👥"
          label="Total de Pacientes"
          value={kpis.totalPatients}
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon="📅"
          label="Consultas Hoje"
          value={kpis.todayAppointments}
          iconColor="bg-teal-100 text-teal-600"
        />
        <StatCard
          icon="✅"
          label="Procedimentos Concluídos"
          value={kpis.completedProcedures}
          iconColor="bg-green-100 text-green-600"
        />
        <StatCard
          icon="⏳"
          label="Pagamentos Pendentes"
          value={kpis.pendingPayments}
          iconColor="bg-orange-100 text-orange-600"
        />
        <StatCard
          icon="💰"
          label="Receita Mensal"
          value={`R$ ${kpis.monthlyRevenue.toFixed(0)}`}
          iconColor="bg-emerald-100 text-emerald-600"
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
          className="p-6 bg-white rounded-xl border border-border hover:border-primary hover:shadow-md transition-all group"
        >
          <div className="icon-circle bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="text-2xl">👤</span>
          </div>
          <h3 className="font-semibold text-foreground">Novo Paciente</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Cadastrar novo paciente
          </p>
        </button>

        <button
          onClick={() => router.push('/consultas')}
          className="p-6 bg-white rounded-xl border border-border hover:border-primary hover:shadow-md transition-all group"
        >
          <div className="icon-circle bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="text-2xl">📅</span>
          </div>
          <h3 className="font-semibold text-foreground">Agendar Consulta</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Nova consulta
          </p>
        </button>

        <button
          onClick={() => router.push('/procedimentos')}
          className="p-6 bg-white rounded-xl border border-border hover:border-primary hover:shadow-md transition-all group"
        >
          <div className="icon-circle bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="text-2xl">🦷</span>
          </div>
          <h3 className="font-semibold text-foreground">Procedimentos</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Gerenciar procedimentos
          </p>
        </button>

        <button
          onClick={() => router.push('/pagamentos')}
          className="p-6 bg-white rounded-xl border border-border hover:border-primary hover:shadow-md transition-all group"
        >
          <div className="icon-circle bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="text-2xl">💵</span>
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
