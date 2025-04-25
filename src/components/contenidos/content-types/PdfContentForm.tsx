'use client';

import { useState, useEffect } from 'react';
import { ContentFormData } from '../ContentForm';

interface PdfContentFormProps {
  data: ContentFormData;
  onChange: (data: Partial<ContentFormData>) => void;
}

export default function PdfContentForm({ data, onChange }: PdfContentFormProps) {
  const [pdfUrl, setPdfUrl] = useState(data.contentUrl || '');
  const [previewError, setPreviewError] = useState('');
  
  // Actualizar el contentUrl cuando cambie la URL
  useEffect(() => {
    onChange({ contentUrl: pdfUrl });
  }, [pdfUrl, onChange]);

  // Verificar si es una URL de PDF válida
  const isValidPdfUrl = (url: string): boolean => {
    if (!url) return false;
    
    // Verificar extensión .pdf
    const pdfExtRegex = /\.pdf(\?.*)?$/i;
    
    // En una implementación real, podríamos hacer una verificación más robusta
    // como fetch con HEAD para verificar el Content-Type
    return pdfExtRegex.test(url);
  };

  // Manejar cambio de URL
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setPdfUrl(newUrl);
    
    if (newUrl && !isValidPdfUrl(newUrl)) {
      setPreviewError('La URL no parece ser un enlace a un archivo PDF válido');
    } else {
      setPreviewError('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="text-lg font-medium text-gray-700">Documento PDF</h3>
        <p className="text-sm text-gray-500">
          Introduce la URL de un documento PDF alojado en un servidor accesible públicamente.
        </p>
      </div>

      <div>
        <label htmlFor="pdfUrl" className="block text-sm font-medium text-gray-700 mb-1">
          URL del PDF <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          id="pdfUrl"
          value={pdfUrl}
          onChange={handleUrlChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://ejemplo.com/documento.pdf"
          required
        />
        
        {previewError && (
          <p className="mt-1 text-sm text-red-600">{previewError}</p>
        )}
        
        <p className="mt-1 text-xs text-gray-500">
          La URL debe apuntar directamente a un archivo PDF. En una futura versión, 
          será posible cargar archivos directamente a la plataforma.
        </p>
      </div>

      {/* Previsualización de PDF */}
      {pdfUrl && !previewError && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Previsualización:</h4>
          <div className="h-[500px] bg-gray-100 rounded-md overflow-hidden">
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="Vista previa del PDF"
            ></iframe>
          </div>
        </div>
      )}

      {/* Campos específicos de metadatos del PDF */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label htmlFor="pdf-page-count" className="block text-sm font-medium text-gray-700 mb-1">
            Número de páginas (opcional)
          </label>
          <input
            type="number"
            id="pdf-page-count"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej. 24"
            onChange={(e) => {
              const pageCount = parseInt(e.target.value) || undefined;
              // Actualizar el contentBody con los metadatos del PDF
              onChange({
                contentBody: {
                  ...data.contentBody,
                  pageCount
                }
              });
            }}
            value={data.contentBody?.pageCount || ''}
          />
        </div>
        
        <div>
          <label htmlFor="pdf-protected" className="block text-sm font-medium text-gray-700 mb-1">
            Protección del documento
          </label>
          <select
            id="pdf-protected"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              const isProtected = e.target.value === 'true';
              // Actualizar el contentBody con los metadatos del PDF
              onChange({
                contentBody: {
                  ...data.contentBody,
                  isProtected
                }
              });
            }}
            value={data.contentBody?.isProtected?.toString() || 'false'}
          >
            <option value="false">No protegido (se puede descargar)</option>
            <option value="true">Protegido (solo visualización)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Nota: La protección depende del servidor donde esté alojado el PDF.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="pdf-toc" className="block text-sm font-medium text-gray-700 mb-1">
          Tabla de contenidos (opcional)
        </label>
        <textarea
          id="pdf-toc"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Introduce la tabla de contenidos o puntos principales del documento..."
          onChange={(e) => {
            const tableOfContents = e.target.value;
            // Actualizar el contentBody con los metadatos del PDF
            onChange({
              contentBody: {
                ...data.contentBody,
                tableOfContents
              }
            });
          }}
          value={data.contentBody?.tableOfContents || ''}
        ></textarea>
        <p className="mt-1 text-xs text-gray-500">
          Añadir la tabla de contenidos ayuda a los estudiantes a navegar por el documento.
        </p>
      </div>
    </div>
  );
}