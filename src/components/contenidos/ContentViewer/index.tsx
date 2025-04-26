'use client';

import { useState, useEffect } from 'react';
import { ContentType } from '@prisma/client';
import TextContentForm from '../content-types/TextContentForm';
import VideoContentForm from '../content-types/VideoContentForm';
import PdfContentForm from '../content-types/PdfContentForm';
import SimulationContentForm from '../content-types/SimulationContentForm';
import QuizRenderer from '../QuizRenderer';
import ExternalLinkForm from '../content-types/ExternalLinkForm';

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
  
  // Adaptador para transformar ContentResource a ContentFormData
  const adaptContentToFormData = () => {
    return {
      title: content.title,
      description: content.description || '',
      summary: content.summary || '',
      type: content.type,
      status: content.status,
      contentUrl: content.contentUrl || '',
      imageUrl: content.imageUrl || '',
      contentBody: content.contentBody || {},
      tags: content.tags || [],
      gradeLevels: content.gradeLevels || [],
      curriculumNodeId: content.curriculumNodeId || '',
      authorName: content.authorName || '',
      duration: content.duration || 0,
      visibility: content.visibility || 'public'
    };
  };
  
  // Función de onChange simulada para los componentes Form
  const handleFormChange = () => {
    // No hacemos nada, solo es para cumplir con la interfaz
    console.log("Cambio ignorado en modo visualización");
  };
  
  // Renderizar el componente específico según el tipo de contenido
  const renderContent = () => {
    const formData = adaptContentToFormData();
    
    switch (content.type) {
      case ContentType.TEXT_CONTENT:
        return (
          <div className="prose max-w-none mode-view">
            <TextContentForm 
              data={formData}
              onChange={handleFormChange}
            />
          </div>
        );
        
      case ContentType.VIDEO:
        return (
          <VideoContentForm 
            data={formData}
            onChange={handleFormChange}
          />
        );
        
      case ContentType.PDF:
        return (
          <PdfContentForm 
            data={formData}
            onChange={handleFormChange}
          />
        );
        
      case ContentType.SIMULATION:
        return (
          <SimulationContentForm 
            data={formData}
            onChange={handleFormChange}
          />
        );
        
      case ContentType.EXTERNAL_LINK:
        return (
          <ExternalLinkForm 
            data={formData}
            onChange={handleFormChange}
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
    <div className="content-viewer">
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
    </div>
  );
}