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
  const [previewMode, setPreviewMode] = useState(false);

  // Actualizar el contentBody cuando cambie el texto
  useEffect(() => {
    onChange({
      contentBody: {
        text: contentText,
        format: 'markdown+latex'
      }
    });
  }, [contentText, onChange]);

  // Insertar fórmula de ejemplo
  const insertLatexExample = () => {
    const formulaExample = '\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}';
    const cursorPos = document.getElementById('text-editor')?.selectionStart || 0;
    
    // Insertar la fórmula en el cursor con delimitadores
    const newText = 
      contentText.substring(0, cursorPos) + 
      '$' + formulaExample + '$' + 
      contentText.substring(cursorPos);
    
    setContentText(newText);
  };

  // Insertar un bloque de fórmula de ejemplo (display mode)
  const insertLatexBlockExample = () => {
    const blockExample = '\\begin{align}\n\\sum_{i=1}^{n} i &= \\frac{n(n+1)}{2}\\\\\n&= \\frac{n^2+n}{2}\n\\end{align}';
    const cursorPos = document.getElementById('text-editor')?.selectionStart || 0;
    
    // Insertar la fórmula en el cursor con delimitadores
    const newText = 
      contentText.substring(0, cursorPos) + 
      '\n$$' + blockExample + '$$\n' + 
      contentText.substring(cursorPos);
    
    setContentText(newText);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-700">Contenido de Texto</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded"
          >
            {previewMode ? 'Volver a Editar' : 'Vista Previa'}
          </button>
        </div>
      </div>

      {/* Barra de herramientas básica */}
      {!previewMode && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-50 border border-gray-200 rounded">
          <button
            type="button"
            onClick={insertLatexExample}
            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm rounded border border-blue-200"
            title="Insertar fórmula en línea"
          >
            {'Insertar $\\frac{a}{b}$'}
          </button>
          <button
            type="button"
            onClick={() => insertMath('\n$$\n\\sum_{i=1}^{n} x_i\n$$\n')} // Adjust LaTeX for insertMath if needed
            className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
            title="Insertar fórmula en bloque"
          >
            {'Insertar $$\\sum_{i=1}^{n}$$'} {/* Wrap in {} and escape backslashes */}
          </button>
          <span className="text-xs text-gray-500 flex items-center">
            Usa $...$ para fórmulas en línea y $$...$$  para fórmulas en bloque
          </span>
        </div>
      )}

      {/* Editor o Vista previa */}
      {previewMode ? (
        <div className="border border-gray-300 rounded-md p-4 bg-white min-h-[300px] prose max-w-none">
          <MathRenderer text={contentText} />
        </div>
      ) : (
        <textarea
          id="text-editor"
          value={contentText}
          onChange={(e) => setContentText(e.target.value)}
          rows={15}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          placeholder="Escribe tu contenido aquí... Puedes usar markdown y LaTeX para las fórmulas matemáticas."
        />
      )}

      <div className="text-sm text-gray-500">
        <p>Formato soportado:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li><code># Título</code> para títulos (usar múltiples # para subtítulos)</li>
          <li><code>*texto*</code> para <em>cursiva</em> y <code>**texto**</code> para <strong>negrita</strong></li>
          <li><code>- item</code> para listas no ordenadas</li>
          <li><code>1. item</code> para listas ordenadas</li>
          <li><code>$a^2 + b^2 = c^2$</code> para fórmulas matemáticas en línea</li>
          <li><code>$$E = mc^2$$</code> para fórmulas matemáticas en bloque</li>
        </ul>
      </div>
    </div>
  );
}