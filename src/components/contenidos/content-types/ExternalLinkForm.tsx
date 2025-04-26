'use client';

import { useState, useEffect } from 'react';
import { ContentFormData } from '../ContentForm';

interface ExternalLinkFormProps {
  data: ContentFormData;
  onChange: (data: Partial<ContentFormData>) => void;
}

export default function ExternalLinkForm({ data, onChange }: ExternalLinkFormProps) {
  const [linkUrl, setLinkUrl] = useState(data.contentUrl || '');
  const [sourceType, setSourceType] = useState(data.contentBody?.sourceType || 'generic');
  
  // Actualizar estado cuando cambian los props
  useEffect(() => {
    setLinkUrl(data.contentUrl || '');
    setSourceType(data.contentBody?.sourceType || 'generic');
  }, [data.contentUrl, data.contentBody]);

  // Generar URL para embebido según el tipo de recurso
  const getEmbedUrl = (): string => {
    if (!linkUrl) return '';
    
    // Configuraciones específicas según el tipo
    switch (sourceType) {
      case 'geogebra':
        // Añadir parámetros específicos de GeoGebra
        const showToolbar = data.contentBody?.showToolbar || false;
        try {
          const geogebraUrl = new URL(linkUrl);
          
          if (!geogebraUrl.searchParams.has('toolbar')) {
            geogebraUrl.searchParams.set('toolbar', showToolbar ? '1' : '0');
          }
          
          return geogebraUrl.toString();
        } catch (e) {
          return linkUrl;
        }
      
      default:
        return linkUrl;
    }
  };

  return (
    <div className="space-y-4">
      {/* Visor de recurso externo */}
      <div className="aspect-video bg-white border border-gray-200 rounded-md overflow-hidden">
        <iframe
          src={getEmbedUrl()}
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          allow="accelerometer; autoplay; camera; microphone; clipboard-write; encrypted-media; gyroscope;"
          frameBorder="0"
          allowFullScreen
          title={data.title || "Recurso externo"}
        ></iframe>
      </div>
      
      {/* Información adicional */}
      <div className="p-4 bg-blue-50 rounded-md">
        <h3 className="text-lg font-medium text-blue-800 mb-2">
          Recurso Externo: {sourceTypeLabel(sourceType)}
        </h3>
        <p className="text-blue-700 mb-2">
          Estás visualizando un recurso alojado en un sitio externo.
        </p>
        <a 
          href={linkUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:underline flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Abrir en una nueva ventana
        </a>
      </div>
    </div>
  );
}

// Función para mostrar etiqueta amigable del tipo de recurso
function sourceTypeLabel(sourceType: string): string {
  const labels: Record<string, string> = {
    'generic': 'Recurso Web',
    'geogebra': 'GeoGebra',
    'desmos': 'Desmos',
    'phet': 'PhET (Simulación)',
    'khan': 'Khan Academy',
    'other': 'Otro Recurso'
  };
  
  return labels[sourceType] || 'Recurso Web';
}