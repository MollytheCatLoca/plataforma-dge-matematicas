// src/app/dashboard/secuencias/[id]/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ContentType, GradeLevel, UserRole } from '@prisma/client';

// Función auxiliar para convertir GradeLevel a texto legible
function getGradeLevelText(gradeLevel: GradeLevel | null): string {
  if (!gradeLevel) return "No especificado";
  
  const gradeLevelMap = {
    FIRST: "Primer año",
    SECOND: "Segundo año",
    THIRD: "Tercer año"
  };
  
  return gradeLevelMap[gradeLevel] || gradeLevel;
}

// Función para mostrar múltiples niveles
function displayGradeLevels(gradeLevels: GradeLevel[] | undefined | null): string {
  if (!gradeLevels || gradeLevels.length === 0) {
    return "No asignado a ningún año";
  }
  
  return gradeLevels.map(level => getGradeLevelText(level)).join(", ");
}

interface SequencePageProps {
  params: {
    id: string;
  };
}

export default async function VistaSecuenciaPage({ params }: SequencePageProps) {
  // Verificar autenticación
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // Obtener la secuencia con sus contenidos
  const sequence = await prisma.learningSequence.findUnique({
    where: { id: params.id },
    include: {
      contents: {
        include: {
          contentResource: true
        },
        orderBy: {
          position: 'asc'
        }
      },
      curriculumNode: true,
      createdBy: {
        select: {
          firstName: true, 
          lastName: true
        }
      }
    }
  });

  // Si no existe, mostrar 404
  if (!sequence) {
    notFound();
  }

  // Verificar si el usuario tiene permisos para editar
  const canEdit = [UserRole.TEACHER, UserRole.SCHOOL_ADMIN, UserRole.DGE_ADMIN].includes(session.user.role);
  
  // Verificar si el contenido es relevante para el año del estudiante
  const userGradeLevel = session.user.gradeLevel;
  const sequenceGradeLevels = sequence.curriculumNode?.gradeLevel || [];
  const isRelevantForStudent = session.user.role === UserRole.STUDENT ? 
    !userGradeLevel || 
    !sequenceGradeLevels.length || 
    sequenceGradeLevels.includes(userGradeLevel) : true;
  
  // Alertar si la secuencia no corresponde al año del estudiante
  const showGradeLevelWarning = session.user.role === UserRole.STUDENT && 
                               userGradeLevel && 
                               sequenceGradeLevels.length > 0 && 
                               !sequenceGradeLevels.includes(userGradeLevel);

  return (
    <div className="container mx-auto p-6">
      {/* Alerta de nivel educativo */}
      {showGradeLevelWarning && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Esta secuencia está diseñada para {displayGradeLevels(sequenceGradeLevels)}, 
                pero tu perfil indica que estás en {getGradeLevelText(userGradeLevel)}. 
                El contenido podría no ser adecuado para tu nivel actual.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Cabecera con detalles básicos */}
      <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-500 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center mb-2">
                <Link href="/dashboard/secuencias" className="text-white hover:text-indigo-100 mr-3">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <h1 className="text-3xl font-bold">{sequence.name}</h1>
              </div>
              <p className="text-indigo-100 text-lg">
                {sequence.description || 'Sin descripción'}
              </p>
            </div>
            {canEdit && (
              <Link 
                href={`/dashboard/secuencias/${sequence.id}/editar`}
                className="px-4 py-2 bg-white text-indigo-700 rounded-md shadow hover:bg-indigo-50 transition flex items-center gap-1"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Link>
            )}
          </div>
          
          <div className="mt-5 flex flex-wrap gap-y-2 gap-x-4 text-sm">
            <div>
              <span className="text-indigo-200">Creado por:</span>{' '}
              <span className="font-medium">
                {sequence.createdBy ? `${sequence.createdBy.firstName} ${sequence.createdBy.lastName}` : 'Usuario desconocido'}
              </span>
            </div>
            
            {/* Años/Niveles destacados */}
            <div className="bg-indigo-800 px-3 py-1 rounded-full">
              <span className="text-indigo-200">Años:</span>{' '}
              <span className="font-medium text-white">
                {displayGradeLevels(sequence.curriculumNode?.gradeLevel)}
              </span>
            </div>
            
            {sequence.curriculumNode && (
              <div>
                <span className="text-indigo-200">Tema curricular:</span>{' '}
                <span className="font-medium">{sequence.curriculumNode.name} ({sequence.curriculumNode.nodeType})</span>
              </div>
            )}
            <div>
              <span className="text-indigo-200">Tipo:</span>{' '}
              <span className="font-medium">{sequence.isTemplate ? 'Plantilla' : 'Personalizada'}</span>
            </div>
            <div>
              <span className="text-indigo-200">Contenidos:</span>{' '}
              <span className="font-medium">{sequence.contents.length}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lista de contenidos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Contenidos de la secuencia
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Esta secuencia está compuesta por {sequence.contents.length} {sequence.contents.length === 1 ? 'recurso' : 'recursos'} en el siguiente orden:
          </p>
        </div>
        
        {sequence.contents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay contenidos en esta secuencia.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sequence.contents.map((position) => {
              // Verificar si este contenido específico es relevante para el año del estudiante
              const contentGradeLevels = position.contentResource.gradeLevels || [];
              const isContentRelevant = session.user.role === UserRole.STUDENT ? 
                !userGradeLevel || 
                contentGradeLevels.length === 0 || 
                contentGradeLevels.includes(userGradeLevel) : true;
              
              return (
                <div key={position.id} className={`p-4 hover:bg-gray-50 ${!isContentRelevant ? 'border-l-4 border-yellow-400' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                      {position.position}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Link
                          href={`/dashboard/contenidos/${position.contentResource.id}`}
                          className="text-lg font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          {position.contentResource.title}
                        </Link>
                        
                        {/* Indicador de años para cada contenido */}
                        {contentGradeLevels.length > 0 && (
                          <span className={`ml-2 text-xs px-2 py-1 rounded-full 
                            ${!isContentRelevant ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-100 text-indigo-800'}`}>
                            {contentGradeLevels.map(gl => gl.substring(0, 1)).join(', ')}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {position.contentResource.type}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${position.isOptional ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {position.isOptional ? 'Opcional' : 'Requerido'}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {position.contentResource.status}
                        </span>
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-600">
                        {position.contentResource.description 
                          ? position.contentResource.description.replace(/<[^>]+>/g, '').substring(0, 120) + (position.contentResource.description.length > 120 ? '...' : '')
                          : 'Sin descripción'
                        }
                      </p>
                      
                      {/* Mostrar años específicos del contenido si difieren de la secuencia */}
                      {contentGradeLevels.length > 0 && !isContentRelevant && (
                        <p className="mt-1 text-xs text-yellow-600">
                          <span className="font-semibold">Nota:</span> Este contenido está dirigido a {displayGradeLevels(contentGradeLevels)}
                        </p>
                      )}
                      
                      {position.contentResource.tags && position.contentResource.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {position.contentResource.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {position.contentResource.imageUrl && (
                      <div className="hidden sm:block h-16 w-24 rounded overflow-hidden">
                        <img 
                          src={position.contentResource.imageUrl}
                          alt={position.contentResource.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Información sobre la relevancia para el estudiante */}
      {session.user.role === UserRole.STUDENT && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Relevancia para tu aprendizaje
          </h2>
          
          {isRelevantForStudent ? (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Esta secuencia de aprendizaje es relevante para tu nivel educativo actual ({getGradeLevelText(userGradeLevel)}).
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Esta secuencia está diseñada para {displayGradeLevels(sequenceGradeLevels)}, 
                    mientras que tu perfil indica que estás en {getGradeLevelText(userGradeLevel)}. 
                    Aunque puedes explorar este contenido, ten en cuenta que el nivel de dificultad 
                    podría no ser el óptimo para tu progreso actual.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Sección opcional: Asignaciones a clases */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Clases asignadas
        </h2>
        
        {/* Sin asignaciones - aquí podríamos mostrar realmente las clases asignadas si tuviéramos esa información */}
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">
            Esta secuencia aún no ha sido asignada a ninguna clase.
          </p>
        </div>
      </div>
    </div>
  );
}