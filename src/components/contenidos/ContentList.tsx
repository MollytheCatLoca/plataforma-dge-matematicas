'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ContentStatus, ContentType, UserRole, GradeLevel } from '@prisma/client';

interface ContentResource {
  id: string;
  title: string;
  description: string | null;
  summary: string | null;
  type: ContentType;
  status: ContentStatus;
  contentUrl: string | null;
  imageUrl: string | null;
  tags: string[];
  gradeLevels: GradeLevel[];
  createdAt: string;
  updatedAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  curriculumNode?: {
    id: string;
    name: string;
    nodeType: string;
  } | null;
}

interface ContentListProps {
  initialFilters?: {
    type?: ContentType;
    status?: ContentStatus;
    gradeLevel?: GradeLevel;
    curriculumNodeId?: string;
    tags?: string[];
  };
}

export default function ContentList({ initialFilters = {} }: ContentListProps) {
  const { data: session, status } = useSession();
  
  // State for readiness based on session
  const [isReadyToFetch, setIsReadyToFetch] = useState<boolean>(status === 'authenticated');
  // Loading state specifically for the fetch operation
  const [loading, setLoading] = useState<boolean>(false); 
  const [contents, setContents] = useState<ContentResource[]>([]);
  const [error, setError] = useState<string>('');
  const [totalItems, setTotalItems] = useState<number>(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [filters, setFilters] = useState({
    type: initialFilters.type || '',
    status: initialFilters.status || '',
    gradeLevel: initialFilters.gradeLevel || '',
    curriculumNodeId: initialFilters.curriculumNodeId || '',
    search: '',
    tags: initialFilters.tags || []
  });

  // Effect 1: Monitor session status and update readiness
  useEffect(() => {
    console.log('[Effect Session] Status:', status);
    if (status === 'authenticated') {
      setIsReadyToFetch(true);
    } else {
      setIsReadyToFetch(false);
      // If session is lost or loading, clear data and stop loading
      setContents([]);
      setTotalItems(0);
      setError('');
      setLoading(false); 
    }
  }, [status]);

  // Effect 2: Fetch data when ready and dependencies change
  useEffect(() => {
    // Only fetch if ready
    if (!isReadyToFetch) {
      console.log('[Effect Fetch] Not ready to fetch.');
      return;
    }

    console.log('[Effect Fetch] Ready. Fetching page:', currentPage, 'filters:', filters);
    setLoading(true); // Start loading for the fetch
    setError(''); 

    const controller = new AbortController();
    const { signal } = controller;
    let isMounted = true; 
    
    const safetyTimeout = setTimeout(() => {
      console.log('[Timeout] Safety timeout triggered after 10s');
      if (isMounted) {
        setError('La carga tardó demasiado, por favor intente de nuevo.');
        setLoading(false); // Stop loading on timeout
        controller.abort(); 
      }
    }, 10000);

    (async () => {
      try {
        const skip = (currentPage - 1) * itemsPerPage;
        let url = `/api/contenidos?skip=${skip}&take=${itemsPerPage}`;
        
        // Include ALL filters in the request
        if (filters.type) url += `&type=${filters.type}`;
        if (filters.status) url += `&status=${filters.status}`;
        if (filters.gradeLevel) url += `&gradeLevel=${filters.gradeLevel}`;
        if (filters.curriculumNodeId) url += `&curriculumNodeId=${filters.curriculumNodeId}`;
        if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
        if (filters.tags && filters.tags.length > 0) url += `&tags=${filters.tags.join(',')}`;
        
        console.log('[Fetch] Starting request for URL:', url);
        const res = await fetch(url, { 
          credentials: 'include', 
          signal,
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        clearTimeout(safetyTimeout);

        console.log('[Fetch] Response status:', res.status);
        if (!res.ok) {
          const errorText = await res.text();
          console.error('[Fetch] Error response:', errorText);
          throw new Error(`Error ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log('[Fetch] Received data:', data);
        
        // Explicitly check data structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format: not an object');
        }
        
        if (!Array.isArray(data.contents)) {
          console.error('[Fetch] Invalid contents array:', data.contents);
          throw new Error('Invalid response format: contents is not an array');
        }
        
        if (isMounted) {
          setContents(data.contents);
          setTotalItems(data.pagination?.total || 0);
          // setLoading(false) handled in finally
        }
        
      } catch (err: any) {
        clearTimeout(safetyTimeout);
        if (err.name !== 'AbortError' && isMounted) {
          console.error('[Fetch] Error:', err);
          setError(`Error al cargar contenidos: ${err.message}`);
          setContents([]);
          setTotalItems(0);
          // setLoading(false) handled in finally
        }
      } finally {
        // Set loading to false if the component is still mounted
        if (isMounted) {
           setLoading(false);
        }
        console.log('[Fetch] Operation completed or aborted');
      }
    })();

    return () => {
      controller.abort(); 
    };
  }, [currentPage, filters, status]); 

  const canManageContent = session?.user.role === UserRole.TEACHER || 
                         session?.user.role === UserRole.SCHOOL_ADMIN || 
                         session?.user.role === UserRole.DGE_ADMIN;

  const getContentTypeName = (type: ContentType): string => {
    const typeNames: Record<ContentType, string> = {
      TEXT_CONTENT: 'Texto',
      VIDEO: 'Video',
      PDF: 'PDF',
      SIMULATION: 'Simulación',
      EXERCISE_SET: 'Ejercicios',
      EVALUATION: 'Evaluación',
      EXTERNAL_LINK: 'Enlace Externo',
      IMAGE: 'Imagen'
    };
    
    return typeNames[type] || type;
  };

  const getContentTypeColor = (type: ContentType): string => {
    const typeColors: Record<ContentType, string> = {
      TEXT_CONTENT: 'bg-blue-100 text-blue-800',
      VIDEO: 'bg-red-100 text-red-800',
      PDF: 'bg-yellow-100 text-yellow-800',
      SIMULATION: 'bg-green-100 text-green-800',
      EXERCISE_SET: 'bg-indigo-100 text-indigo-800',
      EVALUATION: 'bg-purple-100 text-purple-800',
      EXTERNAL_LINK: 'bg-teal-100 text-teal-800',
      IMAGE: 'bg-pink-100 text-pink-800'
    };
    
    return typeColors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusClass = (status: ContentStatus): string => {
    switch (status) {
      case ContentStatus.PUBLISHED:
        return 'bg-green-100 text-green-800';
      case ContentStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case ContentStatus.ARCHIVED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleFilterChange = (name: string, value: string) => {
    console.log('[Debug] handleFilterChange:', name, '→', value);
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const goToPrev = () => {
    console.log('[Debug] prev page click:', currentPage - 1);
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNext = () => {
    console.log('[Debug] next page click:', currentPage + 1);
    setCurrentPage(prev => prev + 1);
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este contenido? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/contenidos/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar el contenido');
      }
      
      setContents(contents.filter(content => content.id !== id));
      setTotalItems(prev => prev - 1);
      
      alert('Contenido eliminado correctamente');
    } catch (err) {
      console.error('Error deleting content:', err);
      alert(err instanceof Error ? err.message : 'Error al eliminar el contenido');
    }
  };

  if (loading) { 
    console.log('[Render] Rendering loading indicator. Status:', status, 'Loading State:', loading);
    return (
      <div className="p-6 text-center">
        <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-3 text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {canManageContent && (
          <Link 
            href="/dashboard/contenidos/crear" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Crear Nuevo Contenido
          </Link>
        )}
        
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.type}
            onChange={e => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos los tipos</option>
            {Object.values(ContentType).map(type => (
              <option key={type} value={type}>
                {getContentTypeName(type)}
              </option>
            ))}
          </select>
          
          {canManageContent && (
            <select
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Todos los estados</option>
              <option value={ContentStatus.PUBLISHED}>Publicado</option>
              <option value={ContentStatus.DRAFT}>Borrador</option>
              <option value={ContentStatus.ARCHIVED}>Archivado</option>
            </select>
          )}
          
          <select
            value={filters.gradeLevel}
            onChange={e => handleFilterChange('gradeLevel', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos los años</option>
            <option value={GradeLevel.FIRST}>Primer Año</option>
            <option value={GradeLevel.SECOND}>Segundo Año</option>
            <option value={GradeLevel.THIRD}>Tercer Año</option>
          </select>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm w-full"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-2 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {contents.length === 0 && !error ? (
          <div className="p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <p className="mt-3 text-gray-600">No se encontraron contenidos</p>
            {canManageContent && (
              <Link 
                href="/dashboard/contenidos/crear" 
                className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Crear primer contenido
              </Link>
            )}
          </div>
        ) : !error ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contenido
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Año/Grado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contents.map((content) => (
                  <tr key={content.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {content.imageUrl ? (
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <img 
                              className="h-10 w-10 rounded-md object-cover" 
                              src={content.imageUrl} 
                              alt={content.title} 
                            />
                          </div>
                        ) : (
                          <div className={`flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center mr-3 ${getContentTypeColor(content.type)}`}>
                            <span className="text-xs font-bold">
                              {getContentTypeName(content.type).substring(0, 2)}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                            <Link href={`/dashboard/contenidos/${content.id}`}>
                              {content.title}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-md">
                            {content.summary || content.description || 'Sin descripción'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getContentTypeColor(content.type)}`}>
                        {getContentTypeName(content.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(content.status)}`}>
                        {content.status === ContentStatus.PUBLISHED ? 'Publicado' : 
                         content.status === ContentStatus.DRAFT ? 'Borrador' : 'Archivado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {content.gradeLevels && content.gradeLevels.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {content.gradeLevels.map(grade => (
                            <span key={grade} className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                              {grade === GradeLevel.FIRST ? '1° Año' : 
                               grade === GradeLevel.SECOND ? '2° Año' : '3° Año'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No especificado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(content.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link 
                          href={`/dashboard/contenidos/${content.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalle"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        
                        {canManageContent && (
                          <Link 
                            href={`/dashboard/contenidos/${content.id}/editar`}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Editar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                        )}
                        
                        {canManageContent && (
                          <button
                            onClick={() => handleDelete(content.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
      
      {totalItems > 0 && !error && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={goToPrev}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={goToNext}
              disabled={currentPage * itemsPerPage >= totalItems}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> de <span className="font-medium">{totalItems}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Paginación">
                <button
                  onClick={goToPrev}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 bg-gray-50">
                  {currentPage}
                </span>
                
                <button
                  onClick={goToNext}
                  disabled={currentPage * itemsPerPage >= totalItems}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}