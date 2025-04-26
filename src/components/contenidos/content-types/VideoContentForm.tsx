'use client';

import { useState, useEffect, useRef } from 'react';
import { ContentFormData } from '../ContentForm';

interface VideoContentFormProps {
  data: ContentFormData;
  onChange: (data: Partial<ContentFormData>) => void;
}

export default function VideoContentForm({ data, onChange }: VideoContentFormProps) {
  const [videoUrl, setVideoUrl] = useState(data.contentUrl || '');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Actualizar videoUrl cuando cambian los datos
  useEffect(() => {
    setVideoUrl(data.contentUrl || '');
  }, [data.contentUrl]);

  // Función para normalizar URL de YouTube para embebido
  const normalizeYouTubeUrl = (url: string): string => {
    if (!url) return '';
    
    // Convertir URL de youtu.be a youtube.com/embed
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Convertir URL de watch a embed
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Si ya es una URL de embed, devolverla tal cual
    if (url.includes('youtube.com/embed')) {
      return url;
    }
    
    // Si no pudimos normalizarla, retornamos la original
    return url;
  };

  // Función para normalizar URL de Vimeo para embebido
  const normalizeVimeoUrl = (url: string): string => {
    if (!url) return '';
    
    // Extraer ID de video de Vimeo
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const match = url.match(vimeoRegex);
    
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }
    
    // Si no pudimos normalizarla, retornamos la original
    return url;
  };

  // Obtener URL para previsualización
  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    if (url.includes('youtube')) {
      return normalizeYouTubeUrl(url);
    }
    
    if (url.includes('vimeo')) {
      return normalizeVimeoUrl(url);
    }
    
    return url;
  };

  // Detectar el tipo de video
  const getVideoType = (url: string): 'youtube' | 'vimeo' | 'direct' | 'unknown' => {
    if (!url) return 'unknown';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    
    if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    
    if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
      return 'direct';
    }
    
    return 'unknown';
  };

  return (
    <div className="space-y-4">
      {/* Visor de video */}
      <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
        {videoUrl && (
          getVideoType(videoUrl) === 'direct' ? (
            <video 
              ref={videoRef}
              src={videoUrl} 
              controls 
              className="w-full h-full object-contain"
              controlsList="nodownload" // Evitar descarga, aunque no siempre funciona
              playsInline
            >
              Tu navegador no soporta la reproducción de videos.
            </video>
          ) : (
            <iframe
              src={getEmbedUrl(videoUrl)}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={data.title}
            ></iframe>
          )
        )}
      </div>

      {/* Mostrar la transcripción si existe */}
      {data.contentBody?.transcription && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Transcripción</h3>
          <div className="prose max-w-none">
            <p>{data.contentBody.transcription}</p>
          </div>
        </div>
      )}
    </div>
  );
}