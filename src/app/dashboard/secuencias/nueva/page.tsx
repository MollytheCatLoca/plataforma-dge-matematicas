// src/app/dashboard/secuencias/nueva/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';
import SecuenciaForm from '@/components/secuencias/SecuenciaForm';
import Link from 'next/link';

export default async function NuevaSecuenciaPage() {
  // Verificar autenticación y permisos
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  
  // Solo permitir a docentes, admins escolares y DGE admin
  if (![UserRole.TEACHER, UserRole.SCHOOL_ADMIN, UserRole.DGE_ADMIN].includes(session.user.role)) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto p-0 sm:p-6">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/secuencias" className="text-indigo-600 hover:text-indigo-800 mr-3">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Nueva Secuencia de Aprendizaje</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <SecuenciaForm />
      </div>
    </div>
  );
}