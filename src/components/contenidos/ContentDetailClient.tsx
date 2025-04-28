// src/components/contenidos/ContentDetailClient.tsx
'use client';

import React, { useState } from 'react';
import ContentViewerClient, { ContentResource } from './ContentViewerClient';

interface ContentDetailClientProps {
  content: ContentResource;
}

export default function ContentDetailClient({ content }: ContentDetailClientProps) {
  const [progress, setProgress] = useState(0);

  const handleProgressUpdate = (newProgress: number) => {
    setProgress(newProgress);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
      <ContentViewerClient content={content} onProgressUpdate={handleProgressUpdate} />
      </div>
      {progress > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Tu progreso</h3>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center text-xs text-white"
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          </div>
        </div>
      )}
    </>
  );
}
