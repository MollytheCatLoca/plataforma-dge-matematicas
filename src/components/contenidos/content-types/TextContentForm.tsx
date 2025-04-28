'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface TextContentFormProps {
  data: {
    contentBody?: {
      text?: string;
      format?: string;
    } | string;
  };
  viewMode?: boolean;
  onChange?: () => void;
}

export default function TextContentForm({
  data,
  viewMode,
  onChange,
}: TextContentFormProps) {
  // 1) Extraemos text (sea string u objeto)
  const text = useMemo(() => {
    if (typeof data.contentBody === 'string') {
      return data.contentBody;
    }
    if (
      data.contentBody &&
      typeof data.contentBody === 'object' &&
      typeof data.contentBody.text === 'string'
    ) {
      return data.contentBody.text;
    }
    return '';
  }, [data.contentBody]);

  // 2) Debug en consola para asegurarnos
  console.log('TextContentForm → text extraído:', text.slice(0, 100), '…');

  // 3) Renderizado
  if (!text) {
    return (
      <div className="p-4 border rounded-md bg-gray-50 text-gray-500 italic">
        No se encontró texto en contentBody
      </div>
    );
  }

  return (
    <div className="prose max-w-none mode-view">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
