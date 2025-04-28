// app/ErrorBoundaryClient.tsx
'use client';

import { useEffect } from 'react';

export default function ErrorBoundaryClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // si el mensaje contiene “Loading chunk”
      if (event.message.includes('Loading chunk')) {
        // recarga completa de la página
        window.location.reload();
      }
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return <>{children}</>;
}
