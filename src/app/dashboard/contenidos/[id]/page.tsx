'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ContentViewer from '@/components/contenidos/ContentViewer';
import ContentTabs from '@/components/contenidos/ContentTabs';
import { UserRole, ContentStatus, ContentType } from '@prisma/client';
import dynamic from 'next/dynamic';

// Carga dinámica para componentes de pestañas específicas
const RelatedContent = dynamic(() => import('@/components/contenidos/RelatedContent'), {
  loading: () => <p>Cargando contenido relacionado...</p>,
  ssr: false
});

const QuizRenderer = dynamic(() => import('@/components/contenidos/QuizRenderer'), {
  loading: () => <p>Cargando evaluación...</p>,
  ssr: false
});

export default function ContentDetailPage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('contenido');
  
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status: sessionStatus } = useSession();
  const contentId = params?.id as string;
  
  // Determinar la pestaña activa basada en la URL
  useEffect(() => {
    if (pathname.includes('/quiz')) {
      setActiveTab('quiz');
    } else if (pathname.includes('/recursos')) {
      setActiveTab('recursos');
    } else {
      setActiveTab('contenido');
    }
  }, [pathname]);
  
  // Cargar contenido
  useEffect(() => {
    // Skip if session not ready
    if (sessionStatus === 'loading') return;
    
    // If not authenticated, redirect to login
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (!contentId) {
      setError('ID de contenido inválido');
      setLoading(false);
      return;
    }
    
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.log('[ContentDetail] Safety timeout triggered');
        setLoading(false);
        setError('Tiempo de carga excedido. Intente nuevamente.');
      }
    }, 10000);
    
    async function fetchContent() {
      try {
        console.log('[ContentDetail] Fetching content:', contentId);
        const response = await fetch(`/api/contenidos/${contentId}`, {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        console.log('[ContentDetail] Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('[ContentDetail] Data received:', data);
        setContent(data);
      } catch (err) {
        console.error('[ContentDetail] Error fetching content:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el contenido');
      } finally {
        clearTimeout(safetyTimeout);
        setLoading(false);
      }
    }
    
    fetchContent();
    
    return () => clearTimeout(safetyTimeout);
  }, [contentId, sessionStatus, router]);

  // Actualizar progreso
  const handleProgressUpdate = async (newProgress: number) => {
    setProgress(newProgress);
    
    // En la versión completa, aquí se actualizaría el progreso en el servidor
    console.log(`Progreso actualizado: ${newProgress}%`);
    
    // Ejemplo de actualización que se implementará en la Etapa 2
    try {
      await fetch(`/api/contenidos/${contentId}/progreso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress: newProgress }),
      });
    } catch (error) {
      console.error('Error al actualizar progreso:', error);
    }
  };
  
  // Determinar las pestañas disponibles según el tipo de contenido
  const getTabs = () => {
    const tabs = [
      {
        id: 'contenido',
        label: 'Contenido',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      },
      {
        id: 'quiz',
        label: 'Evaluación',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
        // Deshabilitar si no hay evaluación o si el tipo de contenido es evaluación
        disabled: !content?.evaluation && content?.type !== ContentType.EVALUATION
      },
      {
        id: 'recursos',
        label: 'Recursos',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )
      }
    ];
    
    return tabs;
  };
  
  // Verificar si el usuario puede editar
  const canEdit = content && session?.user && (
    session.user.id === content.createdBy?.id ||
    [UserRole.SCHOOL_ADMIN, UserRole.DGE_ADMIN].includes(session.user.role as UserRole)
  );

  // Renderizar estado de carga
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando contenido...</p>
      </div>
    );
  }

  // Renderizar estado de error
  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Volver
        </button>
      </div>
    );
  }
  
  // Renderizar contenido
  if (content) {
    return (
      <div className="container mx-auto p-6">
        {/* Header con título y acciones */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <Link 
                href="/dashboard/contenidos" 
                className="mr-4 p-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">{content.title}</h1>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center text-sm text-gray-500">
              {content.createdBy && (
                <span>
                  Creado por: {content.createdBy.firstName} {content.createdBy.lastName}
                </span>
              )}
              
              {content.status && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                  ${content.status === ContentStatus.PUBLISHED ? 'bg-green-100 text-green-800' : 
                    content.status === ContentStatus.DRAFT ? 'bg-gray-100 text-gray-800' : 
                    'bg-red-100 text-red-800'}`}
                >
                  {content.status === ContentStatus.PUBLISHED ? 'Publicado' : 
                   content.status === ContentStatus.DRAFT ? 'Borrador' : 'Archivado'}
                </span>
              )}
              
              {content.curriculumNode && (
                <span className="text-blue-600">
                  {content.curriculumNode.name}
                </span>
              )}
            </div>
          </div>
          
          {/* Acciones */}
          <div className="flex space-x-3">
            {canEdit && (
              <Link
                href={`/dashboard/contenidos/${content.id}/editar`}
                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Link>
            )}
            
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
        
        {/* Etiquetas del contenido */}
        {content.tags && content.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {content.tags.map((tag: string) => (
              <span 
                key={tag} 
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Descripción del contenido */}
        {content.description && (
          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <p className="text-gray-700">{content.description}</p>
          </div>
        )}
        
        {/* Contenido principal */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Sistema de pestañas */}
          <ContentTabs 
            contentId={content.id}
            tabs={getTabs()}
            currentTabId={activeTab}
          />
          
          {/* Contenedor del contenido según la pestaña activa */}
          <div className="p-6">
            {activeTab === 'contenido' && (
              <ContentViewer
                content={content}
                onProgressUpdate={handleProgressUpdate}
              />
            )}
            
            {activeTab === 'quiz' && content.evaluation && (
              <QuizRenderer
                evaluation={content.evaluation}
                contentId={content.id}
              />
            )}
            
            {activeTab === 'quiz' && content.type === ContentType.EVALUATION && !content.evaluation && (
              <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-700">
                  Este contenido es una evaluación, pero los detalles no se han cargado correctamente.
                </p>
              </div>
            )}
            
            {activeTab === 'quiz' && content.type !== ContentType.EVALUATION && !content.evaluation && (
              <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-700">
                  Este contenido no tiene evaluaciones disponibles.
                </p>
              </div>
            )}
            
            {activeTab === 'recursos' && (
              <RelatedContent 
                contentId={content.id} 
                tags={content.tags || []}
                curriculumNodeId={content.curriculumNodeId}
              />
            )}
          </div>
        </div>
        
        {/* Barra de progreso global */}
        {progress > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Tu progreso</h3>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center text-xs text-white" 
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return null; // Fallback
}