// src/app/dashboard/curriculum/nuevo/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import Link from 'next/link';
import CurriculumNodeForm from '@/components/curriculum/CurriculumNodeForm';

export default async function NuevoNodoCurricularPage() {
  // Verificar autenticación
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // Solo permitir a administradores DGE y administradores escolares
  if (![UserRole.DGE_ADMIN, UserRole.SCHOOL_ADMIN].includes(session.user.role as UserRole)) {
    redirect('/dashboard');
  }

  // Obtener nodos existentes para el selector de padres
  const parentNodes = await prisma.curriculumNode.findMany({
    orderBy: {
      name: 'asc'
    },
    select: {
      id: true,
      name: true,
      nodeType: true
    }
  });

  return (
    <div className="container mx-auto p-0 sm:p-6">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/curriculum" className="text-blue-600 hover:text-blue-800 mr-3">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Nuevo Nodo Curricular</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <CurriculumNodeForm parentNodes={parentNodes} />
      </div>
    </div>
  );
}