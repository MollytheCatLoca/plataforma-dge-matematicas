// src/components/contenidos/ContentViewerClient.tsx
'use client';

import ContentViewer, { ContentResource } from './ContentViewer';

interface ContentViewerClientProps {
  content: ContentResource;
  onProgressUpdate?: (progress: number) => void;
}

export default function ContentViewerClient({ content, onProgressUpdate }: ContentViewerClientProps) {
  return (
    <div className="content-viewer">
      <ContentViewer content={content} onProgressUpdate={onProgressUpdate} />
    </div>
  );
}
