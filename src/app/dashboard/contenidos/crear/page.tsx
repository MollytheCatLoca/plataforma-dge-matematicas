// src/app/dashboard/contenidos/crear/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';
import ContentForm from '@/components/contenidos/ContentForm';
import Link from 'next/link';

export default async function CrearContenidoPage() {
  // Verificar autenticación
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // Solo ciertos roles pueden crear contenido
  if (![UserRole.TEACHER, UserRole.SCHOOL_ADMIN, UserRole.DGE_ADMIN].includes(session.user.role as UserRole)) {
    return (
      <div className="container mx-auto p-6 bg-red-50 border border-red-200 rounded-lg mt-8">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Acceso Denegado</h1>
        <p className="text-red-600 mb-4">
          No tienes permisos para crear contenido en la plataforma.
        </p>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link 
            href="/dashboard/contenidos" 
            className="mr-4 p-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Crear Nuevo Contenido</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-gray-600 mb-4">
          Complete el formulario para crear un nuevo recurso de contenido. Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Selecciona el tipo de contenido adecuado según el recurso que deseas crear. 
          Cada tipo tiene campos específicos y opciones diferentes.
        </p>

        <ContentForm />
      </div>
    </div>
  );
}