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
  const [previewError, setPreviewError] = useState('');
  
  // Actualizar el contentUrl cuando cambie la URL
  useEffect(() => {
    onChange({ 
      contentUrl: linkUrl,
      contentBody: {
        ...data.contentBody,
        sourceType
      }
    });
  }, [linkUrl, sourceType, onChange, data.contentBody]);

  // Verificar si es una URL válida
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Manejar cambio de URL
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setLinkUrl(newUrl);
    
    if (newUrl && !isValidUrl(newUrl)) {
      setPreviewError('La URL no parece ser válida');
    } else {
      setPreviewError('');
      
      // Detectar automáticamente el tipo de fuente
      if (newUrl.includes('geogebra.org')) {
        setSourceType('geogebra');
      } else if (newUrl.includes('desmos.com')) {
        setSourceType('desmos');
      } else if (newUrl.includes('phet.colorado.edu')) {
        setSourceType('phet');
      } else if (newUrl.includes('khan')) {
        setSourceType('khan');
      } else {
        setSourceType('generic');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="text-lg font-medium text-gray-700">Enlace Externo</h3>
        <p className="text-sm text-gray-500">
          Introduce un enlace a un recurso educativo externo, como GeoGebra, Desmos, PhET u otros.
        </p>
      </div>

      <div>
        <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-1">
          URL del Recurso <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          id="linkUrl"
          value={linkUrl}
          onChange={handleUrlChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://www.geogebra.org/m/example"
          required
        />
        
        {previewError && (
          <p className="mt-1 text-sm text-red-600">{previewError}</p>
        )}
        
        <p className="mt-1 text-xs text-gray-500">
          La URL debe apuntar directamente al recurso que deseas incorporar.
        </p>
      </div>

      <div>
        <label htmlFor="sourceType" className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Recurso
        </label>
        <select
          id="sourceType"
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="generic">Genérico</option>
          <option value="geogebra">GeoGebra</option>
          <option value="desmos">Desmos</option>
          <option value="phet">PhET (Simulaciones)</option>
          <option value="khan">Khan Academy</option>
          <option value="other">Otro</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Seleccionar el tipo correcto mejora la integración con la plataforma.
        </p>
      </div>

      {/* Previsualización de enlace */}
      {linkUrl && !previewError && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Previsualización:</h4>
          <div className="p-4 border border-gray-300 rounded-md">
            {sourceType === 'geogebra' || sourceType === 'desmos' || sourceType === 'phet' ? (
              <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                <iframe
                  src={linkUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  title="Vista previa del recurso"
                ></iframe>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-center">
                  <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                    {linkUrl}
                  </a>
                </p>
                <p className="text-xs text-center mt-2 text-gray-500">
                  (Abre en una nueva ventana)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Campos específicos según el tipo de recurso */}
      {sourceType === 'geogebra' && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Opciones para GeoGebra:</h4>
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="show-toolbar"
              checked={data.contentBody?.showToolbar || false}
              onChange={(e) => {
                onChange({
                  contentBody: {
                    ...data.contentBody,
                    showToolbar: e.target.checked
                  }
                });
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="show-toolbar" className="ml-2 block text-sm text-gray-700">
              Mostrar barra de herramientas
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            <a href="https://wiki.geogebra.org/en/Reference:GeoGebra_App_Parameters" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Ver documentación de GeoGebra para más opciones
            </a>
          </p>
        </div>
      )}

      {/* Más campos específicos según tipo de recurso... */}
    </div>
  );
}