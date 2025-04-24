'use client';

import { useEffect, useState, useRef } from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface MathRendererProps {
  text: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ text }) => {
  const [renderedContent, setRenderedContent] = useState('');
  const processingRef = useRef(false);

  useEffect(() => {
    if (!text || processingRef.current) {
      return;
    }

    processingRef.current = true;

    try {
      // Función para procesar el texto y renderizar las fórmulas
      const processText = (input: string) => {
        // Dividir el texto en fragmentos basados en delimitadores matemáticos
        const parts = [];
        let lastIndex = 0;
        
        // Expresión regular para encontrar fórmulas matemáticas (tanto inline como display)
        // Actualizamos para asegurarnos de que capturamos correctamente las fórmulas multilínea
        // [\s\S] captura cualquier carácter, incluidos saltos de línea, a diferencia de . (punto)
        const mathPattern = /(\$\$[\s\S]*?\$\$)|(\$[^\$\n]+?\$)/g;
        let match;
        
        while ((match = mathPattern.exec(input)) !== null) {
          // Añadir texto antes de la fórmula
          if (match.index > lastIndex) {
            parts.push({
              type: 'text',
              content: input.substring(lastIndex, match.index)
            });
          }
          
          const formula = match[0];
          const isDisplay = formula.startsWith('$$');
          
          // Extraer la fórmula sin los delimitadores
          const formulaContent = isDisplay 
            ? formula.substring(2, formula.length - 2).trim() 
            : formula.substring(1, formula.length - 1).trim();
          
          // Añadir la fórmula procesada
          parts.push({
            type: 'math',
            content: formulaContent,
            display: isDisplay,
            originalFormula: formula // Almacenamos la fórmula original para depuración
          });
          
          lastIndex = match.index + formula.length;
        }
        
        // Añadir el texto restante después de la última fórmula
        if (lastIndex < input.length) {
          parts.push({
            type: 'text',
            content: input.substring(lastIndex)
          });
        }
        
        // Convertir los fragmentos en HTML
        return parts.map((part, index) => {
          if (part.type === 'text') {
            // Procesar saltos de línea en texto normal
            // Mantener los párrafos y formatos de lista
            const paragraphs = part.content
              .split('\n\n') // Dividir por párrafos (doble salto de línea)
              .filter(p => p.trim().length > 0)
              .map(paragraph => {
                // Si comienza con un guión o un número seguido de punto, formatear como lista
                if (/^\s*-\s/.test(paragraph)) {
                  // Lista no ordenada
                  return `<ul>${paragraph.split(/\n\s*-\s/).filter(Boolean).map(item => 
                    `<li>${item.trim()}</li>`).join('')}</ul>`;
                } else if (/^\s*\d+\.\s/.test(paragraph)) {
                  // Lista ordenada
                  return `<ol>${paragraph.split(/\n\s*\d+\.\s/).filter(Boolean).map(item => 
                    `<li>${item.trim()}</li>`).join('')}</ol>`;
                } else {
                  // Párrafo normal
                  return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
                }
              });

            return paragraphs.join('');
          } else {
            try {
              // Intentamos renderizar con KaTeX
              return katex.renderToString(part.content, {
                displayMode: part.display,
                throwOnError: false,
                output: 'html',
                macros: {
                  // Definimos macros comunes si es necesario
                  "\\R": "\\mathbb{R}"
                }
              });
            } catch (error) {
              console.error('Error al renderizar fórmula:', error, part.originalFormula);
              // En caso de error, mostramos la fórmula original en rojo
              return `<span class="text-red-500">[Error en fórmula: ${part.originalFormula}]</span>`;
            }
          }
        }).join('');
      };

      // Procesar y actualizar el contenido
      const processed = processText(text);
      setRenderedContent(processed);
    } catch (error) {
      console.error('Error general en MathRenderer:', error);
      setRenderedContent(`<p>${text}</p><p class="text-red-500">[Error al procesar contenido matemático]</p>`);
    } finally {
      processingRef.current = false;
    }
  }, [text]);

  // Aplicar estilos específicos para mejorar la visualización de las fórmulas
  return (
    <div 
      className="math-content prose max-w-none"
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};

export default MathRenderer;