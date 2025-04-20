// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Plataforma DGE Matemáticas',
  description: 'Plataforma educativa para la Dirección General de Escuelas',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  // Layout principal de la app
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Podés insertar acá un componente <Header /> si lo necesitás */}
        <main className="min-h-screen">
          {children}
        </main>
        {/* Y acá un <Footer /> */}
      </body>
    </html>
  );
}
