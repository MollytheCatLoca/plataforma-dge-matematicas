'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function ContentDetailPage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const contentId = params?.id as string;
  
  console.log('[ContentDetail] Params:', params, 'ID:', contentId);

  useEffect(() => {
    // Skip if session not ready
    if (sessionStatus === 'loading') return;
    
    // If not authenticated, redirect to login
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (!contentId) {
      setError('ID de contenido inválido');
      setLoading(false);
      return;
    }
    
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.log('[ContentDetail] Safety timeout triggered');
        setLoading(false);
        setError('Tiempo de carga excedido. Intente nuevamente.');
      }
    }, 10000);
    
    async function fetchContent() {
      try {
        console.log('[ContentDetail] Fetching content:', contentId);
        const response = await fetch(`/api/contenidos/${contentId}`, {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        console.log('[ContentDetail] Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('[ContentDetail] Data received:', data);
        setContent(data);
      } catch (err) {
        console.error('[ContentDetail] Error fetching content:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el contenido');
      } finally {
        clearTimeout(safetyTimeout);
        setLoading(false);
      }
    }
    
    fetchContent();
    
    return () => clearTimeout(safetyTimeout);
  }, [contentId, sessionStatus, router]);

  // Render loading state
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando contenido...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Volver
        </button>
      </div>
    );
  }
  
  // Render content
  if (content) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Content Display */}
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{content.title}</h1>
            {/* Add more content display here */}
          </div>
        </div>
      </div>
    );
  }
  
  return null; // Fallback
}