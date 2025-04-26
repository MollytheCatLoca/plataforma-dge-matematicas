'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ContentType, ContentStatus } from '@prisma/client';

interface RelatedContentProps {
  contentId: string;
  tags?: string[];
  curriculumNodeId?: string;
}

interface RelatedItem {
  id: string;
  title: string;
  type: ContentType;
  summary?: string | null;
  imageUrl?: string | null;
  tags: string[];
}

export default function RelatedContent({ contentId, tags = [], curriculumNodeId }: RelatedContentProps) {
  const [relatedContent, setRelatedContent] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Cargar contenido relacionado
  useEffect(() => {
    // Si no hay tags ni curriculumNodeId, no tenemos criterios para buscar
    if (tags.length === 0 && !curriculumNodeId) {
      setLoading(false);
      return;
    }
    
    async function fetchRelatedContent() {
      try {
        // En esta primera versión, usaremos la API de contenidos existente con filtros
        let url = '/api/contenidos?';
        
        // Filtrar por etiquetas
        if (tags.length > 0) {
          url += `tags=${tags.join(',')}&`;
        }
        
        // Filtrar por nodo curricular
        if (curriculumNodeId) {
          url += `curriculumNodeId=${curriculumNodeId}&`;
        }
        
        // Asegurar que solo se muestren contenidos publicados
        url += `status=${ContentStatus.PUBLISHED}&`;
        
        // Limitar la cantidad
        url += 'take=5';
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Filtrar el contenido actual de la lista de relacionados
        const filtered = data.contents.filter((item: any) => item.id !== contentId);
        
        setRelatedContent(filtered);
      } catch (err) {
        console.error('Error fetching related content:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar contenido relacionado');
      } finally {
        setLoading(false);
      }
    }
    
    fetchRelatedContent();
  }, [contentId, tags, curriculumNodeId]);
  
  // Obtener el nombre del tipo de contenido
  const getContentTypeName = (type: ContentType): string => {
    const typeNames: Record<string, string> = {
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
  
  // Obtener el color para el tipo de contenido
  const getContentTypeColor = (type: ContentType): string => {
    const typeColors: Record<string, string> = {
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
  
  // Renderizar estado de carga
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-3 text-gray-600">Cargando contenido relacionado...</p>
      </div>
    );
  }
  
  // Renderizar error
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }
  
  // Si no hay contenido relacionado
  if (relatedContent.length === 0) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-md text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-3 text-gray-600">No se encontraron contenidos relacionados.</p>
      </div>
    );
  }
  
  // Renderizar lista de contenido relacionado
  return (
    <div className="related-content">
      <h3 className="text-lg font-semibold mb-4">Contenido Relacionado</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedContent.map(item => (
          <Link 
            href={`/dashboard/contenidos/${item.id}`}
            key={item.id}
            className="block bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getContentTypeColor(item.type)}`}>
                  {getContentTypeName(item.type)}
                </span>
              </div>
              
              <h4 className="text-lg font-medium text-gray-900 mb-2">{item.title}</h4>
              
              {item.summary && (
                <p className="text-sm text-gray-600 line-clamp-2">{item.summary}</p>
              )}
              
              {item.tags && item.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}