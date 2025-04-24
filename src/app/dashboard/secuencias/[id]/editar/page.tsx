// src/app/dashboard/secuencias/[id]/editar/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { UserRole } from '@prisma/client';
import Link from 'next/link';
import SecuenciaForm from '@/components/secuencias/SecuenciaForm';
import ContenidosSecuencia from '@/components/secuencias/ContenidosSecuencia';

interface EditarSecuenciaPageProps {
  params: {
    id: string;
  };
}

export default async function EditarSecuenciaPage({ params }: EditarSecuenciaPageProps) {
  const { id } = params;
  
  // Verificar autenticación y permisos
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  
  // Solo permitir a docentes, admins escolares y DGE admin
  if (![UserRole.TEACHER, UserRole.SCHOOL_ADMIN, UserRole.DGE_ADMIN].includes(session.user.role)) {
    redirect('/dashboard');
  }

  // Obtener la secuencia y sus contenidos
  const secuencia = await prisma.learningSequence.findUnique({
    where: { id },
    include: {
      contents: {
        include: {
          contentResource: {
            select: {
              id: true,
              title: true,
              type: true,
              status: true,
              description: true
            }
          }
        },
        orderBy: {
          position: 'asc'
        }
      }
    }
  });

  if (!secuencia) {
    notFound();
  }

  // Datos iniciales para el formulario
  const initialData = {
    name: secuencia.name,
    description: secuencia.description || '',
    curriculumNodeId: secuencia.curriculumNodeId || '',
    isTemplate: secuencia.isTemplate
  };

  return (
    <div className="container mx-auto p-0 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/dashboard/secuencias" className="text-indigo-600 hover:text-indigo-800 mr-3">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Editar Secuencia</h1>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/secuencias/${id}`}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Ver vista previa
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de datos generales */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Información general</h2>
            <SecuenciaForm secuenciaId={id} initialData={initialData} />
          </div>
        </div>
        
        {/* Editor de contenidos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestión de contenidos</h2>
            <ContenidosSecuencia secuencia={secuencia} />
          </div>
        </div>
      </div>
    </div>
  );
}