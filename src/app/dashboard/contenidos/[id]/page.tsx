// src/app/dashboard/contenidos/[id]/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ContentStatus, ContentType, GradeLevel, UserRole } from '@prisma/client';
import Link from 'next/link';
import MathRenderer from '@/components/MathRenderer';
import ContentAssistant from '@/components/ContentAssistant';
import CommentSection from '@/components/CommentSection';

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

  const contentId = params.id;
  
  // Obtener el contenido con todos sus datos relacionados
  const content = await prisma.contentResource.findUnique({
    where: { id: contentId },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      curriculumNode: {
        include: {
          parent: true,
          prerequisites: {
            include: {
              prerequisite: true
            }
          }
        }
      },
      evaluation: {
        include: {
          _count: {
            select: { questions: true }
          }
        }
      },
      // Secuencias que contienen este contenido
      sequencePositions: {
        include: {
          sequence: {
            include: {
              curriculumNode: true,
              createdBy: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      },
      // Si el usuario actual ha iniciado o completado este contenido
      ContentProgress: session ? {
        where: {
          userProgressId: {
            equals: session.user.id
          }
        }
      } : undefined
    }
  });

  // Si no existe, mostrar página de 404
  if (!content) {
    notFound();
  }

  // Verificar si el usuario puede editar (es creador o admin)
  const canEdit = content.createdById === session.user.id || 
                 [UserRole.SCHOOL_ADMIN, UserRole.DGE_ADMIN].includes(session.user.role);

  // Verificar si hay progreso del usuario actual en este contenido
  const userProgress = content.ContentProgress && content.ContentProgress.length > 0 
    ? content.ContentProgress[0] 
    : null;

  // Buscar contenidos relacionados (mismo nodo curricular o secuencias)
  const relatedContents = await prisma.contentResource.findMany({
    where: {
      AND: [
        { id: { not: contentId } }, // Excluir el contenido actual
        {
          OR: [
            { curriculumNodeId: content.curriculumNodeId },
            { 
              sequencePositions: {
                some: {
                  sequence: {
                    id: {
                      in: content.sequencePositions.map(sp => sp.sequenceId)
                    }
                  }
                }
              }
            }
          ]
        }
      ]
    },
    select: {
      id: true,
      title: true,
      summary: true,
      type: true,
      imageUrl: true,
      gradeLevels: true
    },
    take: 5
  });

  // Función auxiliar para mostrar el tipo de contenido de forma legible
  const getContentTypeName = (type: ContentType) => {
    const typeNames: Record<string, string> = {
      TEXT_CONTENT: 'Texto',
      VIDEO: 'Video',
      PDF: 'Documento PDF',
      SIMULATION: 'Simulación',
      EXERCISE_SET: 'Conjunto de Ejercicios',
      EVALUATION: 'Evaluación',
      EXTERNAL_LINK: 'Enlace Externo',
      IMAGE: 'Imagen'
    };
    return typeNames[type] || type;
  };

  // Función para obtener info del grado/año
  const getGradeLevelName = (level: GradeLevel) => {
    const levelNames: Record<string, string> = {
      FIRST: 'Primer Año',
      SECOND: 'Segundo Año',
      THIRD: 'Tercer Año'
    };
    return levelNames[level] || level;
  };

  // Función para renderizar el contenido según su tipo
  const renderContentByType = () => {
    switch(content.type) {
      case ContentType.TEXT_CONTENT:
        return (
          <div className="prose prose-blue max-w-none">
            <MathRenderer text={content.description || ''} />
            
            {content.contentBody?.text && (
              <div className="mt-4">
                <MathRenderer text={content.contentBody.text} />
              </div>
            )}
          </div>
        );
        
      case ContentType.VIDEO:
        return (
          <div>
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
              {content.contentUrl && (
                <iframe 
                  src={content.contentUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
            
            <div className="prose prose-blue max-w-none mt-4">
              <MathRenderer text={content.description || ''} />
            </div>
          </div>
        );
        
      case ContentType.PDF:
        return (
          <div>
            <div className="h-[600px] bg-gray-100 rounded-lg overflow-hidden mb-4">
              {content.contentUrl && (
                <iframe
                  src={content.contentUrl}
                  className="w-full h-full"
                  frameBorder="0"
                ></iframe>
              )}
            </div>
            
            <div className="prose prose-blue max-w-none mt-4">
              <MathRenderer text={content.description || ''} />
            </div>
          </div>
        );
        
      case ContentType.EXTERNAL_LINK:
        return (
          <div>
            <div className="bg-gray-50 border rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">Enlace Externo</h3>
              <p className="mb-4">{content.description}</p>
              <a 
                href={content.contentUrl || '#'} 
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
              >
                Abrir Recurso Externo
              </a>
            </div>
          </div>
        );
      
      case ContentType.EVALUATION:
        return (
          <div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Evaluación</h3>
              <p className="mb-2">Esta evaluación consta de {content.evaluation?._count.questions || 0} preguntas.</p>
              <p className="mb-4">Tiempo límite: {content.evaluation?.timeLimitMinutes || '--'} minutos</p>
              <Link 
                href={`/dashboard/evaluaciones/${contentId}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
              >
                Iniciar Evaluación
              </Link>
            </div>
            
            <div className="prose prose-blue max-w-none mt-4">
              <MathRenderer text={content.description || ''} />
            </div>
          </div>
        );
        
      // Renderizar otros tipos de contenido...
        
      default:
        return (
          <div className="prose prose-blue max-w-none">
            <MathRenderer text={content.description || ''} />
          </div>
        );
    }
  };
  
  // Registrar visualización del contenido (si el usuario es estudiante)
  if (session.user.role === UserRole.STUDENT) {
    try {
      // Intentar actualizar progreso existente
      if (userProgress) {
        await prisma.contentProgress.update({
          where: { id: userProgress.id },
          data: {
            lastAccessAt: new Date(),
            timeSpentMinutes: { increment: 1 },
            status: userProgress.status === 'NOT_STARTED' ? 'IN_PROGRESS' : undefined
          }
        });
      } else {
        // Verificar si el usuario tiene un registro de progreso
        const userProgressRecord = await prisma.userProgress.findUnique({
          where: { userId: session.user.id }
        });
        
        // Si no existe, crear uno
        if (!userProgressRecord) {
          await prisma.userProgress.create({
            data: {
              userId: session.user.id,
              lastActivityAt: new Date(),
              contentProgresses: {
                create: {
                  contentResourceId: contentId,
                  status: 'IN_PROGRESS',
                  firstAccessAt: new Date(),
                  lastAccessAt: new Date(),
                  timeSpentMinutes: 1
                }
              }
            }
          });
        } else {
          // Si existe, añadir progreso para este contenido
          await prisma.contentProgress.create({
            data: {
              userProgressId: userProgressRecord.id,
              contentResourceId: contentId,
              status: 'IN_PROGRESS',
              firstAccessAt: new Date(),
              lastAccessAt: new Date(),
              timeSpentMinutes: 1
            }
          });
        }
      }
    } catch (e) {
      console.error("Error al actualizar progreso:", e);
      // Continuar mostrando el contenido incluso si hay error en el seguimiento
    }
  }

  return (
    <div className="container mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="flex mb-6 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link href="/dashboard/contenidos" className="hover:text-blue-600">Contenidos</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium truncate">{content.title}</span>
      </nav>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contenido principal - 2/3 del ancho en escritorio */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Imagen destacada */}
            {content.imageUrl && (
              <div className="h-64 overflow-hidden border-b">
                <img 
                  src={content.imageUrl} 
                  alt={content.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Contenido */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-800">{content.title}</h1>
                
                {canEdit && (
                  <Link
                    href={`/dashboard/contenidos/${contentId}/editar`}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Editar
                  </Link>
                )}
              </div>
              
              {/* Información básica */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {getContentTypeName(content.type)}
                </span>
                
                <span className={`px-2 py-1 rounded-full text-sm ${
                  content.status === ContentStatus.PUBLISHED 
                    ? 'bg-green-100 text-green-800' 
                    : content.status === ContentStatus.DRAFT
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {content.status === ContentStatus.PUBLISHED ? 'Publicado' : 
                   content.status === ContentStatus.DRAFT ? 'Borrador' : 'Archivado'}
                </span>
                
                {content.gradeLevels?.map(level => (
                  <span key={level} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {getGradeLevelName(level)}
                  </span>
                ))}
                
                {content.tags?.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Contenido principal según el tipo */}
              <div className="mb-8">
                {renderContentByType()}
              </div>
              
              {/* Asistente AI si usuario es estudiante */}
              {session.user.role === UserRole.STUDENT && (
                <div className="mt-8">
                  <ContentAssistant contentText={content.description || ''} />
                </div>
              )}
              
              {/* Sección de comentarios y valoraciones */}
              <CommentSection contentId={contentId} />
            </div>
          </div>
        </div>
        
        {/* Sidebar - 1/3 del ancho en escritorio */}
        <div className="lg:col-span-1">
          {/* Ruta Curricular */}
          {content.curriculumNode && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Ubicación Curricular</h2>
              
              <div className="flex flex-col space-y-2">
                {content.curriculumNode.parent?.parent && (
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-2">Año</span>
                    <span>{content.curriculumNode.parent.parent.name}</span>
                  </div>
                )}
                
                {content.curriculumNode.parent && (
                  <div className="flex items-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs mr-2">Eje</span>
                    <span>{content.curriculumNode.parent.name}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs mr-2">Unidad</span>
                  <span>{content.curriculumNode.name}</span>
                </div>
              </div>
              
              {/* Prerequisitos */}
              {content.curriculumNode.prerequisites && content.curriculumNode.prerequisites.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Prerequisitos</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {content.curriculumNode.prerequisites.map(prereq => (
                      <li key={prereq.prerequisiteId}>{prereq.prerequisite.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Progreso del Estudiante */}
          {session.user.role === UserRole.STUDENT && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Tu Progreso</h2>
              
              {userProgress ? (
                <div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Estado: {userProgress.status === 'NOT_STARTED' ? 'No iniciado' :
                                userProgress.status === 'IN_PROGRESS' ? 'En progreso' : 'Completado'}
                      </span>
                      {userProgress.status === 'COMPLETED' && (
                        <span className="text-sm font-medium text-green-600">✓ Completado</span>
                      )}
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ 
                          width: `${userProgress.status === 'NOT_STARTED' ? 0 : 
                                  userProgress.status === 'IN_PROGRESS' ? 50 : 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Primer acceso: {userProgress.firstAccessAt && new Date(userProgress.firstAccessAt).toLocaleDateString()}</p>
                    <p>Último acceso: {userProgress.lastAccessAt && new Date(userProgress.lastAccessAt).toLocaleDateString()}</p>
                    <p>Tiempo dedicado: {userProgress.timeSpentMinutes} minutos</p>
                    
                    {userProgress.status !== 'COMPLETED' && (
                      <button 
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-full"
                        onClick={async () => {
                          // Marcar como completado
                          await fetch(`/api/progress/${contentId}/complete`, { method: 'POST' });
                          window.location.reload();
                        }}
                      >
                        Marcar como Completado
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No has iniciado este contenido aún.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Secuencias donde aparece este contenido */}
          {content.sequencePositions.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Secuencias de Aprendizaje</h2>
              
              <div className="space-y-4">
                {content.sequencePositions.map(sp => (
                  <div key={sp.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <Link 
                      href={`/dashboard/secuencias/${sp.sequenceId}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {sp.sequence.name}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">
                      Posición {sp.position} {sp.isOptional ? '(opcional)' : '(requerido)'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Creada por: {sp.sequence.createdBy.firstName} {sp.sequence.createdBy.lastName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Contenidos relacionados */}
          {relatedContents.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Contenidos Relacionados</h2>
              
              <div className="space-y-4">
                {relatedContents.map(related => (
                  <div key={related.id} className="flex items-center gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                    {related.imageUrl ? (
                      <img 
                        src={related.imageUrl} 
                        alt={related.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-xs font-medium text-gray-500">
                        Sin imagen
                      </div>
                    )}
                    
                    <div>
                      <Link 
                        href={`/dashboard/contenidos/${related.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {related.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        {getContentTypeName(related.type)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}