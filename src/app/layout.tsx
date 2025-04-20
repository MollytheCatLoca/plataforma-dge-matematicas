// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthContext from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Plataforma DGE Matemáticas',
  description: 'Plataforma educativa para la Dirección General de Escuelas',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthContext>
          <Navbar />
          <main className="min-h-screen bg-gray-50 pt-4">
            {children}
          </main>
        </AuthContext>
      </body>
    </html>
  );
}