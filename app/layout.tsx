import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DentistFlow - Sistema de Gerenciamento",
  description: "Sistema de gerenciamento para consultório odontológico",
};

function Sidebar() {
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
        <SidebarLink href="/" icon="📊">
          Dashboard
        </SidebarLink>
        <SidebarLink href="/calendario" icon="📅">
          Calendário
        </SidebarLink>
        <SidebarLink href="/pacientes" icon="👥">
          Pacientes
        </SidebarLink>
        <SidebarLink href="/consultas" icon="🩺">
          Consultas
        </SidebarLink>
        <SidebarLink href="/procedimentos" icon="🦷">
          Procedimentos
        </SidebarLink>
        <SidebarLink href="/pagamentos" icon="💰">
          Pagamentos
        </SidebarLink>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
            DS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Dr. Silva</p>
            <p className="text-xs text-muted-foreground truncate">Dentista</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  // Note: usePathname needs 'use client' so this will be extracted to a client component
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <span className="text-lg">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <Sidebar />

          {/* Main Content - offset by sidebar width */}
          <main className="ml-64 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
