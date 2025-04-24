// src/app/dashboard/curriculum/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import Link from 'next/link';
import CurriculumTreeView from '@/components/curriculum/CurriculumTreeView';

export default async function CurriculumPage() {
  // Verificar autenticación
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // Solo permitir a administradores DGE y administradores escolares
  if (![UserRole.DGE_ADMIN, UserRole.SCHOOL_ADMIN].includes(session.user.role as UserRole)) {
    redirect('/dashboard');
  }

  // Obtener todos los nodos curriculares
  const nodes = await prisma.curriculumNode.findMany({
    orderBy: {
      order: { sort: 'asc', nulls: 'last' }
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true
        }
      },
      children: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return (
    <div className="container mx-auto p-0 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Estructura Curricular</h1>
        <Link 
          href="/dashboard/curriculum/nuevo"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
        >
          Nuevo Nodo
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Jerarquía Curricular
          </h2>
          <p className="text-gray-600">
            Esta estructura define la organización del currículo y asigna los niveles educativos (años) a cada componente.
          </p>
        </div>

        {nodes.length > 0 ? (
          <CurriculumTreeView nodes={nodes} />
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">
              No hay nodos curriculares definidos. 
              Crea el primer nodo para comenzar a estructurar el currículo.
            </p>
            <Link 
              href="/dashboard/curriculum/nuevo"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Crear Nodo Raíz
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}