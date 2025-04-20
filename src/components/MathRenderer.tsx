// src/components/MathRenderer.tsx
'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface MathRendererProps {
  text: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ text }) => {
  const processText = (content: string) => {
    // Patrones para detectar fórmulas LaTeX
    const displayMathPattern = /\$\$(.*?)\$\$/g;
    const inlineMathPattern = /\$(.*?)\$/g;
    
    // Primero procesar las fórmulas de display ($$...$$)
    let processedContent = content.replace(displayMathPattern, (match, formula) => {
      try {
        const html = katex.renderToString(formula, { 
          displayMode: true,
          throwOnError: false
        });
        return `<div class="math-display">${html}</div>`;
      } catch (error) {
        console.error('Error al renderizar fórmula display:', error);
        return match; // Devolver el texto original si hay un error
      }
    });
    
    // Luego procesar las fórmulas inline ($...$)
    processedContent = processedContent.replace(inlineMathPattern, (match, formula) => {
      try {
        const html = katex.renderToString(formula, { 
          displayMode: false,
          throwOnError: false
        });
        return `<span class="math-inline">${html}</span>`;
      } catch (error) {
        console.error('Error al renderizar fórmula inline:', error);
        return match; // Devolver el texto original si hay un error
      }
    });
    
    return processedContent;
  };

  return (
    <div 
      className="math-content"
      dangerouslySetInnerHTML={{ __html: processText(text) }}
    />
  );
};

export default MathRenderer;