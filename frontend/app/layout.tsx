import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/AppLayout";
import { ConfirmProvider } from "@/contexts/ConfirmContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DentistFlow - Sistema de Gerenciamento",
  description: "Sistema de gerenciamento para consultório odontológico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ConfirmProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster richColors closeButton position="top-right" />
        </ConfirmProvider>
      </body>
    </html>
  );
}

