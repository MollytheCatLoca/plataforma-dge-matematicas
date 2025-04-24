// src/app/dashboard/secuencias/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';

export default async function SecuenciasPage() {
  // Verificar autenticación y permisos
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  
  // Solo permitir a docentes, admins escolares y DGE admin
  if (![UserRole.TEACHER, UserRole.SCHOOL_ADMIN, UserRole.DGE_ADMIN].includes(session.user.role)) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Acceso restringido</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Solo los docentes y administradores pueden acceder a la gestión de secuencias de aprendizaje.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Obtener secuencias de aprendizaje
  const secuencias = await prisma.learningSequence.findMany({
    include: {
      curriculumNode: true,
      createdBy: {
        select: { firstName: true, lastName: true }
      },
      contents: {
        include: {
          contentResource: {
            select: {
              title: true,
              type: true,
              status: true
            }
          }
        },
        orderBy: {
          position: 'asc'
        }
      },
    },
    orderBy: {
      name: 'asc'
    }
  });

  return (
    <div className="container mx-auto p-0 sm:p-6">
      {/* Cabecera visual */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-500 rounded-t-lg h-28 flex items-end px-6 pb-3 shadow-md mb-6">
        <h1 className="text-3xl font-extrabold text-white drop-shadow">Secuencias de Aprendizaje</h1>
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">
          Gestiona las secuencias de aprendizaje para organizar el contenido curricular de forma coherente.
        </p>
        <Link 
          href="/dashboard/secuencias/nueva" 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nueva Secuencia
        </Link>
      </div>
      
      {secuencias.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <p className="text-gray-500 mb-4">No hay secuencias de aprendizaje creadas todavía.</p>
          <Link
            href="/dashboard/secuencias/nueva"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition inline-flex items-center gap-2"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear primera secuencia
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {secuencias.map((secuencia) => (
            <div 
              key={secuencia.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition"
            >
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">{secuencia.name}</h2>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {secuencia.description || "Sin descripción"}
                </p>
                
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <div>
                    <span className="font-semibold">Tema:</span> {secuencia.curriculumNode?.name || "No asignado"}
                  </div>
                  <div>
                    <span className="font-semibold">{secuencia.contents.length}</span> contenidos
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <p className="text-xs text-gray-500">
                    Creada por: {secuencia.createdBy.firstName} {secuencia.createdBy.lastName}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Link 
                      href={`/dashboard/secuencias/${secuencia.id}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver detalle
                    </Link>
                    <Link 
                      href={`/dashboard/secuencias/${secuencia.id}/editar`}
                      className="text-amber-600 hover:text-amber-800 text-sm font-medium flex items-center gap-1"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}