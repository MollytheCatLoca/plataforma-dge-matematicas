'use client';

import { useState, useEffect } from 'react';
import { ContentFormData } from '../ContentForm';
import MathRenderer from '@/components/MathRenderer';

interface TextContentFormProps {
  data: ContentFormData;
  onChange: (data: Partial<ContentFormData>) => void;
}

export default function TextContentForm({ data, onChange }: TextContentFormProps) {
  const [contentText, setContentText] = useState(data.contentBody?.text || '');
  const [previewMode, setPreviewMode] = useState(true); // En modo visualización, siempre mostrar preview

  // Inicializar el contenido desde los datos
  useEffect(() => {
    // Actualizar solo cuando cambian los datos externos
    setContentText(data.contentBody?.text || '');
    // Forzar modo preview para visualización
    setPreviewMode(true);
  }, [data.contentBody]);

  return (
    <div className="space-y-4">
      {/* Solo mostrar el contenido, sin la barra de herramientas ni botones de edición */}
      <div className="border border-gray-300 rounded-md p-4 bg-white min-h-[300px] prose max-w-none">
        <MathRenderer text={contentText} />
      </div>
    </div>
  );
}