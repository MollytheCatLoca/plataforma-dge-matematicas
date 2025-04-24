// src/app/contenidos/[id]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import MathRenderer from '@/components/MathRenderer';
import Link from 'next/link';
import ContentAssistant from '@/components/ContentAssistant';
import InteractiveRenderer from '@/components/InteractiveRenderer';
import ShareButtons from '@/components/ShareButtons';
import CommentSection from '@/components/CommentSection';
import PrintButton from '@/components/PrintButton';
import { UserRole } from '@prisma/client';

interface ContentDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
  // Verificar autenticación
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // Extraer el ID de los parámetros de forma segura
  const { id } = params;

  // Obtener el contenido específico con información completa
  const content = await prisma.contentResource.findUnique({
    where: { id: id },
    include: {
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
        }
      },
      curriculumNode: true
    }
  });

  // Si no existe, mostrar 404
  if (!content) {
    notFound();
  }

  // Si no está publicado y el usuario es estudiante, no mostrar
  if (content.status !== 'PUBLISHED' && session.user.role === UserRole.STUDENT) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Contenido no disponible</h1>
          <p>Este contenido no está disponible actualmente.</p>
          <Link href="/contenidos" className="mt-4 inline-block text-blue-600 hover:underline">
            Volver a la lista de contenidos
          </Link>
        </div>
      </div>
    );
  }

  // Buscar evaluación (quiz) asociada a este contenido
  const evaluation = await prisma.evaluation.findUnique({
    where: { contentResourceId: content.id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
    },
  });

  // Preparar el contenido a mostrar
  const contentText = content.description || '';
  const contentBody = content.contentBody ? 
    (typeof content.contentBody === 'string' ? content.contentBody : JSON.stringify(content.contentBody)) 
    : '';
  
  // Determinar autor - podría ser un campo directo o venir de la relación
  const authorName = content.createdBy ? 
    `${content.createdBy.firstName} ${content.createdBy.lastName}` : 
    (content.author || 'Equipo Educativo DGE');

  // Obtener recursos relacionados por tema curricular o tags
  const relatedResources = await prisma.contentResource.findMany({
    where: {
      id: { not: content.id },
      status: 'PUBLISHED',
      OR: [
        content.curriculumNodeId ? { curriculumNodeId: content.curriculumNodeId } : {},
        content.tags?.length > 0 ? { tags: { hasSome: content.tags } } : {},
      ],
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  // Determinar si el usuario actual puede editar el contenido
  const canEdit = session.user.role === UserRole.TEACHER || 
                 session.user.role === UserRole.SCHOOL_ADMIN || 
                 session.user.role === UserRole.DGE_ADMIN;

  // UI Mejorada para la página de detalle de contenido
  return (
    <div className="container mx-auto p-0 sm:p-6">
      {/* Hero con imagen de portada y título */}
      <div
        className="relative rounded-t-lg h-64 md:h-80 lg:h-96 overflow-hidden"
        style={{
          backgroundImage: content.imageUrl ? `url(${content.imageUrl})` : 'url(/images/math-bg-default.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
        <div className="relative z-10 h-full flex flex-col justify-end p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block bg-blue-600 text-white font-bold rounded-full px-3 py-1 text-sm">
              {content.type}
            </span>
            {content.curriculumNode && (
              <span className="inline-block bg-green-600 text-white font-bold rounded-full px-3 py-1 text-sm">
                {content.curriculumNode.name}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md">
            {content.title}
          </h1>
        </div>
      </div>
      
      <div className="bg-white rounded-b-lg shadow-md p-6 -mt-20 md:-mt-24 lg:-mt-32 relative z-10">
        <Link href="/contenidos" className="text-blue-600 hover:underline mb-6 inline-flex items-center gap-1">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a la lista
        </Link>
        
        {/* Metadatos del contenido en forma de tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {content.tags?.map((tag, index) => (
            <span key={index} className="inline-block bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-semibold">
              {tag}
            </span>
          ))}
        </div>

        {/* Contenido principal */}
        <div className="mb-8">
          {content.type === 'VIDEO' && content.contentUrl ? (
            <div className="aspect-video">
              <video src={content.contentUrl} controls className="w-full h-full rounded-lg shadow-md object-cover" />
            </div>
          ) : content.type === 'PDF' && content.contentUrl ? (
            <iframe src={content.contentUrl} className="w-full h-[600px] rounded-lg shadow-md" />
          ) : content.type === 'SIMULATION' && content.contentBody ? (
            <div className="bg-gray-50 p-4 rounded-lg shadow-md">
              <InteractiveRenderer config={content.contentBody} />
            </div>
          ) : (
            <div className="prose prose-blue lg:prose-lg max-w-none">
              <MathRenderer text={contentText} />
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 p-4 rounded-lg my-8 border-l-4 border-blue-400">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Información</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-semibold">Autor:</span> {authorName}
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold">Publicado:</span> {new Date(content.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            {content.updatedAt && new Date(content.updatedAt).getTime() > new Date(content.createdAt).getTime() + 86400000 && (
              <div className="flex items-center gap-2">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Actualizado:</span> {new Date(content.updatedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            )}
            {content.curriculumNode && (
              <div className="flex items-center gap-2">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="font-semibold">Tema curricular:</span> {content.curriculumNode.name}
              </div>
            )}
            {content.gradeLevels?.length > 0 && (
              <div className="flex items-center gap-2">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="font-semibold">Grados:</span> {content.gradeLevels.map(level => level.toLowerCase()).join(', ')}
              </div>
            )}
            {content.duration && (
              <div className="flex items-center gap-2">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Duración:</span> {Math.floor(content.duration/60)}:{String(content.duration % 60).padStart(2,'0')} min
              </div>
            )}
          </div>
        </div>

        {/* Asistente interactivo de IA */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6 border border-blue-100">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Asistente interactivo
          </h2>
          <p className="text-gray-600 mb-4">
            Este es tu asistente de aprendizaje. ¡Puedes preguntarle sobre cualquier concepto que no hayas entendido del contenido!
          </p>
          <ContentAssistant contentText={contentText} />
        </div>

        {/* Quiz divertido asociado al contenido */}
        {evaluation && evaluation.questions.length > 0 && (
          <div className="mt-10 p-6 bg-yellow-50 rounded-lg shadow-lg border border-yellow-200 animate-fade-in">
            <h2 className="text-2xl font-bold text-yellow-700 mb-4 flex items-center gap-2">
              <span role="img" aria-label="Quiz">🧩</span> ¡Pon a prueba lo aprendido!
            </h2>
            <form className="space-y-8">
              {evaluation.questions.map((q, idx) => (
                <div key={q.id} className="bg-white rounded-lg p-4 shadow flex flex-col gap-2 border-l-4 border-yellow-400">
                  <div className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                    <span className="text-yellow-500 font-extrabold">{idx + 1}.</span> 
                    <MathRenderer text={q.text} />
                  </div>
                  {q.type === 'MULTIPLE_CHOICE' && q.options && (
                    <div className="flex flex-col gap-2 mt-2">
                      {JSON.parse(q.options).map((opt: any, i: number) => (
                        <label key={opt.id} className="flex items-center gap-2 cursor-pointer hover:bg-yellow-100 rounded px-2 py-1 transition">
                          <input type="radio" name={`q_${q.id}`} value={opt.id} className="accent-yellow-500" />
                          <MathRenderer text={opt.text} inline={true} />
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type === 'MULTIPLE_SELECT' && q.options && (
                    <div className="flex flex-col gap-2 mt-2">
                      {JSON.parse(q.options).map((opt: any, i: number) => (
                        <label key={opt.id} className="flex items-center gap-2 cursor-pointer hover:bg-yellow-100 rounded px-2 py-1 transition">
                          <input type="checkbox" name={`q_${q.id}_${opt.id}`} value={opt.id} className="accent-yellow-500" />
                          <MathRenderer text={opt.text} inline={true} />
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type === 'TRUE_FALSE' && (
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-yellow-100 rounded px-2 py-1 transition">
                        <input type="radio" name={`q_${q.id}`} value="true" className="accent-yellow-500" />
                        Verdadero
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-yellow-100 rounded px-2 py-1 transition">
                        <input type="radio" name={`q_${q.id}`} value="false" className="accent-yellow-500" />
                        Falso
                      </label>
                    </div>
                  )}
                  {q.type === 'SHORT_ANSWER' && (
                    <div className="mt-2">
                      <input 
                        type="text" 
                        name={`q_${q.id}`} 
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        placeholder="Escribe tu respuesta aquí"
                      />
                    </div>
                  )}
                  {q.type === 'NUMERIC' && (
                    <div className="mt-2">
                      <input 
                        type="number" 
                        name={`q_${q.id}`} 
                        step="any"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        placeholder="Ingresa un valor numérico"
                      />
                    </div>
                  )}
                  {q.type === 'MATH_INTERACTIVE' && (
                    <div className="mt-2 bg-white p-3 rounded-lg border border-yellow-200">
                      <div className="text-sm text-gray-600 mb-2">Utiliza el editor para escribir tu respuesta matemática:</div>
                      <div className="bg-gray-50 p-3 rounded">
                        {/* Aquí iría un componente para el editor matemático interactivo */}
                        <textarea 
                          name={`q_${q.id}`} 
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          placeholder="Escribe tu respuesta en formato LaTeX: ej. \\frac{1}{2}"
                          rows={4}
                        ></textarea>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                className="mt-6 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded shadow transition text-lg flex items-center gap-2"
              >
                <span role="img" aria-label="rocket">🚀</span> ¡Enviar respuestas!
              </button>
            </form>
          </div>
        )}

        {/* Recursos relacionados */}
        {relatedResources.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Recursos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedResources.map(res => (
                <Link 
                  key={res.id} 
                  href={`/contenidos/${res.id}`} 
                  className="block group rounded-lg overflow-hidden shadow hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                    {res.imageUrl ? (
                      <img src={res.imageUrl} alt={res.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <span className="font-semibold">{res.type}</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/80 rounded-full px-2 py-1 text-xs font-bold text-blue-800">
                      {res.type}
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition">{res.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{res.summary || res.description?.replace(/<[^>]+>/g,'').substring(0,80)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sección de Comentarios */}
        <CommentSection contentId={content.id} />

        {/* Área de acciones */}
        <div className="mt-8 flex flex-wrap gap-3">
          {canEdit && (
            <Link 
              href={`/contenidos/${content.id}/editar`} 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-semibold shadow"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </Link>
          )}
          
          {/* Botón para descargar o imprimir */}
          <PrintButton />
          
          {/* Botón de compartir */}
          <ShareButtons 
            title={content.title} 
            url={typeof window !== 'undefined' ? window.location.href : ''}
          />
        </div>
      </div>
    </div>
  );
}