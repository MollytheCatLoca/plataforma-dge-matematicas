// src/app/contenidos/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ContentosPage() {
  // Verificar autenticación
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  const gradeLevel = session.user.gradeLevel;
  const whereClause: any = { status: 'PUBLISHED' };
  if (session.user.role === 'STUDENT' && gradeLevel) {
    whereClause.gradeLevels = { has: gradeLevel };
  }

  // Obtener contenidos publicados (todos los usuarios pueden ver contenidos publicados)
  const contentResources = await prisma.contentResource.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="container mx-auto p-0 sm:p-6">
      {/* Cabecera visual */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-lg h-28 flex items-end px-6 pb-3 shadow-md mb-2">
        <h1 className="text-3xl font-extrabold text-white drop-shadow">Contenidos Disponibles</h1>
      </div>
      {contentResources.length === 0 ? (
        <div className="text-center bg-white rounded-lg shadow p-8">
          <p className="text-gray-500">No hay contenidos disponibles actualmente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {contentResources.map((content) => (
            <Link 
              href={`/dashboard/contenidos/${content.id}`} 
              key={content.id}
              className="block group focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg"
            >
              <div className="bg-white rounded-lg shadow p-6 h-full border border-transparent group-hover:border-blue-400 group-hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block bg-blue-100 text-blue-700 font-bold rounded-full px-3 py-0.5 text-xs shadow">{content.type}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-blue-800 mb-2 group-hover:underline line-clamp-2">
                    {content.title}
                  </h2>
                  <div className="text-gray-600 line-clamp-3 text-base mb-3 min-h-[3.5em]">
                    {content.description ? (
                      <span>{content.description.replace(/<[^>]+>/g, '').substring(0, 120)}...</span>
                    ) : (
                      <span className="italic">Sin descripción</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mt-4 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-gray-500">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {new Date(content.createdAt).toLocaleDateString()}
                  </div>
                  <span className="text-green-600 font-semibold">Publicado</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}