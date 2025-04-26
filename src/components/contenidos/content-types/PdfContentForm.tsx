'use client';

import { useState, useEffect } from 'react';
import { ContentFormData } from '../ContentForm';

interface PdfContentFormProps {
  data: ContentFormData;
  onChange: (data: Partial<ContentFormData>) => void;
}

export default function PdfContentForm({ data, onChange }: PdfContentFormProps) {
  const [pdfUrl, setPdfUrl] = useState(data.contentUrl || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(data.contentBody?.pageCount || 0);
  
  // Actualizar datos cuando cambia el prop
  useEffect(() => {
    setPdfUrl(data.contentUrl || '');
    setTotalPages(data.contentBody?.pageCount || 0);
  }, [data.contentUrl, data.contentBody]);

  // Manejar cambio de página
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-4">
      {/* Controles básicos */}
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="px-3 py-1 bg-white border rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          
          <span className="text-sm">
            Página {currentPage} de {totalPages || '?'}
          </span>
          
          <button 
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages && totalPages > 0}
            className="px-3 py-1 bg-white border rounded-md disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
        
        <div>
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            download={!data.contentBody?.isProtected}
          >
            {data.contentBody?.isProtected ? 'Abrir PDF' : 'Descargar PDF'}
          </a>
        </div>
      </div>
      
      {/* Visor de PDF */}
      <div className="h-[calc(100vh-300px)] bg-gray-100">
        <iframe
          src={pdfUrl}
          className="w-full h-full"
          title={data.title}
        ></iframe>
      </div>
      
      {/* Tabla de contenidos si está disponible */}
      {data.contentBody?.tableOfContents && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Tabla de Contenidos</h3>
          <p className="whitespace-pre-line">{data.contentBody.tableOfContents}</p>
        </div>
      )}
    </div>
  );
}