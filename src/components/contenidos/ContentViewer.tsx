'use client';

import { useState, useEffect } from 'react';
import { ContentType } from '@prisma/client';
import TextContentForm from './content-types/TextContentForm';
import VideoContentForm from './content-types/VideoContentForm';
import PdfContentForm from './content-types/PdfContentForm';
import SimulationContentForm from './content-types/SimulationContentForm';
import QuizRenderer from './QuizRenderer';
import ExternalLinkForm from './content-types/ExternalLinkForm';
import ContentAssistant from '../ContentAssistant';

// Define la interfaz para el contenido según tu modelo Prisma
export interface ContentResource {
  id: string;
  title: string;
  description?: string | null;
  summary?: string | null;
  type: ContentType;
  status: string;
  contentUrl?: string | null;
  imageUrl?: string | null;
  contentBody?: any; // JSON genérico
  tags?: string[];
  gradeLevels?: string[];
  authorName?: string | null;
  duration?: number | null;
  visibility?: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    image?: string | null;
  };
  curriculumNodeId?: string | null;
  curriculumNode?: {
    id: string;
    name: string;
    nodeType: string;
  } | null;
  evaluation?: any; // Para cuando el contenido está relacionado con una evaluación
}

interface ContentViewerProps {
  content: ContentResource;
  onProgressUpdate?: (progress: number) => void;
}

export default function ContentViewer({ content, onProgressUpdate }: ContentViewerProps) {
  const [progress, setProgress] = useState(0);
  
  // Registrar vista al cargar
  useEffect(() => {
    const registerView = async () => {
      try {
        // Aquí se implementará la llamada a la API para registrar la vista
        console.log('Vista registrada para:', content.id);
      } catch (error) {
        console.error('Error al registrar vista:', error);
      }
    };
    
    registerView();
    
    // Cronómetro para tiempo de visualización
    const startTime = Date.now();
    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000); // Tiempo en segundos
      console.log(`Tiempo de visualización: ${duration}s`);
      // Aquí se implementará la llamada a la API para registrar el tiempo
    };
  }, [content.id]);
  
  // Actualizar progreso
  const handleProgressUpdate = (newProgress: number) => {
    setProgress(newProgress);
    if (onProgressUpdate) {
      onProgressUpdate(newProgress);
    }
  };
  
  // Renderizar el componente específico según el tipo de contenido
  const renderContent = () => {
    // IMPORTANTE: Creamos directamente el objeto formData aquí, NO a través de una función
    // Esta es la corrección principal para evitar problemas de referencia
    const formData = {
      title: content.title,
      description: content.description || '',
      summary: content.summary || '',
      type: content.type,
      status: content.status,
      contentUrl: content.contentUrl || '',
      imageUrl: content.imageUrl || '',
      contentBody: content.contentBody, // Pasamos directamente, sin modificar
      tags: content.tags || [],
      gradeLevels: content.gradeLevels || [],
      curriculumNodeId: content.curriculumNodeId || '',
      authorName: content.authorName || '',
      duration: content.duration || 0,
      visibility: content.visibility || 'public'
    };
    
    
    switch (content.type) {
      case ContentType.TEXT_CONTENT:
        return (
          <div className="prose max-w-none mode-view">
            {/* Contenido básico antes del componente específico */}
            <div className="mb-4">
              {content.imageUrl && (
                <img 
                  src={content.imageUrl} 
                  alt={content.title}
                  className="w-full h-48 object-cover rounded-md mb-4" 
                />
              )}
        
              {content.description && (
                <p className="text-gray-600 mb-4">{content.description}</p>
              )}
            </div>
            
            {/* IMPORTANTE: JSON personalizado solo para TextContentForm */}
           
            
            {/* Usando datos directos para TextContentForm */}
            <TextContentForm
  data={{ contentBody: content.contentBody }}
  viewMode={true}
/>

          </div>
        );
        
      case ContentType.VIDEO:
        return (
          <VideoContentForm 
            data={formData}
            onChange={() => {}}
          />
        );
        
      case ContentType.PDF:
        return (
          <PdfContentForm 
            data={formData}
            onChange={() => {}}
          />
        );
        
      case ContentType.SIMULATION:
        return (
          <SimulationContentForm 
            data={formData}
            onChange={() => {}}
          />
        );
        
      case ContentType.EXTERNAL_LINK:
        return (
          <ExternalLinkForm 
            data={formData}
            onChange={() => {}}
          />
        );
        
      case ContentType.EVALUATION:
        if (content.evaluation) {
          return (
            <QuizRenderer 
              evaluation={content.evaluation}
              contentId={content.id}
            />
          );
        } else {
          return (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">
                Evaluación no disponible
              </h3>
              <p className="text-yellow-700">
                Los detalles de esta evaluación no se han cargado correctamente.
              </p>
            </div>
          );
        }
        
      default:
        return (
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Tipo de contenido no soportado
            </h3>
            <p className="text-yellow-700">
              El tipo de contenido {content.type} aún no tiene un visor implementado.
            </p>
          </div>
        );
    }
  };
  
  return (
    <div className="content-viewer bg-white p-6 rounded-lg shadow-md">
      {/* Información de debug */}
      
      
      {/* Barra de progreso */}
      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      
      {/* Contenido específico */}
      <div className="content-display">
        {renderContent()}
      </div>
      
      {/* Contenido crudo (para debug) */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
       
        <pre className="text-sm text-gray-600">
        <ContentAssistant />
        </pre>
      </div>
      
      {/* Información adicional */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            {content.createdBy && (
              <>
                {content.createdBy.image ? (
                  <img 
                    src={content.createdBy.image} 
                    alt={`${content.createdBy.firstName} ${content.createdBy.lastName}`}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-600">
                      {content.createdBy.firstName?.charAt(0)}
                      {content.createdBy.lastName?.charAt(0)}
                    </span>
                  </div>
                )}
                <span>
                  {content.createdBy.firstName} {content.createdBy.lastName}
                </span>
              </>
            )}
            
            {!content.createdBy && content.authorName && (
              <span>{content.authorName}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {content.duration && (
              <div className="flex items-center space-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{content.duration} min</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(content.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}