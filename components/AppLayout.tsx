'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

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
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white text-xl">
                        🦷
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-primary">DentistFlow</h1>
                        <p className="text-xs text-muted-foreground">Gestão Dental</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                <SidebarLink href="/" icon="📊" active={isActive('/')}>
                    Dashboard
                </SidebarLink>
                <SidebarLink href="/calendario" icon="📅" active={isActive('/calendario')}>
                    Calendário
                </SidebarLink>
                <SidebarLink href="/pacientes" icon="👥" active={isActive('/pacientes')}>
                    Pacientes
                </SidebarLink>
                <SidebarLink href="/consultas" icon="🩺" active={isActive('/consultas')}>
                    Consultas
                </SidebarLink>
                <SidebarLink href="/procedimentos" icon="🦷" active={isActive('/procedimentos')}>
                    Procedimentos
                </SidebarLink>
                <SidebarLink href="/pagamentos" icon="💰" active={isActive('/pagamentos')}>
                    Pagamentos
                </SidebarLink>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    );
}

function SidebarLink({ href, icon, children, active }: { href: string; icon: string; children: React.ReactNode; active: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active
                    ? 'bg-primary/20 text-primary'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
        >
            <span className="text-lg">{icon}</span>
            <span>{children}</span>
        </Link>
    );
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();

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
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
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
