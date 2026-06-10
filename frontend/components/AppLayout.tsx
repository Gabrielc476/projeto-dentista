'use client';

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import {
    LayoutDashboard,
    Calendar,
    Users,
    Stethoscope,
    Activity,
    DollarSign,
    Building,
    HeartPulse,
    UserCircle,
    LogOut
} from "lucide-react";

function Sidebar() {
    const { logout, username } = useAuth();
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 glass-sidebar flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white transition-all duration-300 group-hover:scale-105 group-hover:rotate-6">
                        <HeartPulse className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-primary tracking-tight">DentistFlow</h1>
                        <p className="text-xs text-muted-foreground">Gestão Dental</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                <SidebarLink href="/" icon={<LayoutDashboard className="w-4 h-4" />} active={isActive('/')}>
                    Dashboard
                </SidebarLink>
                <SidebarLink href="/calendario" icon={<Calendar className="w-4 h-4" />} active={isActive('/calendario')}>
                    Calendário
                </SidebarLink>
                <SidebarLink href="/pacientes" icon={<Users className="w-4 h-4" />} active={isActive('/pacientes')}>
                    Pacientes
                </SidebarLink>
                <SidebarLink href="/consultas" icon={<Stethoscope className="w-4 h-4" />} active={isActive('/consultas')}>
                    Consultas
                </SidebarLink>
                <SidebarLink href="/procedimentos" icon={<Activity className="w-4 h-4" />} active={isActive('/procedimentos')}>
                    Procedimentos
                </SidebarLink>
                <SidebarLink href="/pagamentos" icon={<DollarSign className="w-4 h-4" />} active={isActive('/pagamentos')}>
                    Pagamentos
                </SidebarLink>

                {/* Separator for Clinic Management */}
                <div className="pt-4 pb-2">
                    <p className="px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                        Gestão da Clínica
                    </p>
                </div>
                <SidebarLink href="/medicos" icon={<UserCircle className="w-4 h-4" />} active={isActive('/medicos')}>
                    Médicos
                </SidebarLink>
                <SidebarLink href="/locacoes" icon={<Building className="w-4 h-4" />} active={isActive('/locacoes')}>
                    Locações
                </SidebarLink>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg border border-border/40">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold shadow-sm">
                        {username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{username || 'Usuário'}</p>
                        <p className="text-xs text-muted-foreground truncate">Admin</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                        title="Sair"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
}

function SidebarLink({ href, icon, children, active }: { href: string; icon: React.ReactNode; children: React.ReactNode; active: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${active
                ? 'bg-primary/20 text-primary shadow-sm'
                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
        >
            <span className={`text-lg transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>{icon}</span>
            <span>{children}</span>
        </Link>
    );
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Login page doesn't need sidebar
    if (pathname === '/login') {
        return <>{children}</>;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        useEffect(() => {
            router.push('/login');
        }, [router]);

        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Authenticated layout with sidebar
    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AuthenticatedLayout>{children}</AuthenticatedLayout>
        </AuthProvider>
    );
}
