'use client';

import { useState, useEffect } from 'react';
import { ContentFormData } from '../ContentForm';

interface VideoContentFormProps {
  data: ContentFormData;
  onChange: (data: Partial<ContentFormData>) => void;
}

export default function VideoContentForm({ data, onChange }: VideoContentFormProps) {
  const [videoUrl, setVideoUrl] = useState(data.contentUrl || '');
  const [previewError, setPreviewError] = useState('');
  
  // Actualizar el contentUrl cuando cambie la URL
  useEffect(() => {
    onChange({ contentUrl: videoUrl });
  }, [videoUrl, onChange]);

  // Verificar si es una URL de video válida
  const isValidVideoUrl = (url: string): boolean => {
    if (!url) return false;
    
    // URLs de YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    
    // URLs de Vimeo
    const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+/;
    
    // URLs generales de video (simplificado)
    const videoExtRegex = /\.(mp4|webm|ogg)(\?.*)?$/i;
    
    return youtubeRegex.test(url) || vimeoRegex.test(url) || videoExtRegex.test(url);
  };

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

  // Manejar cambio de URL
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setVideoUrl(newUrl);
    
    if (newUrl && !isValidVideoUrl(newUrl)) {
      setPreviewError('La URL no parece ser un enlace de video válido (YouTube, Vimeo o archivo de video)');
    } else {
      setPreviewError('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="text-lg font-medium text-gray-700">Video</h3>
        <p className="text-sm text-gray-500">
          Soporta enlaces de YouTube, Vimeo o URLs directas a archivos MP4/WebM.
        </p>
      </div>

      <div>
        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
          URL del Video <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          id="videoUrl"
          value={videoUrl}
          onChange={handleUrlChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://www.youtube.com/watch?v=example"
          required
        />
        
        {previewError && (
          <p className="mt-1 text-sm text-red-600">{previewError}</p>
        )}
        
        <p className="mt-1 text-xs text-gray-500">
          Para YouTube: pegá el enlace completo del video o el enlace acortado (youtu.be).
          <br />
          Para Vimeo: pegá el enlace completo del video.
          <br />
          Para archivos de video: pegá la URL pública del archivo MP4, WebM u OGG.
        </p>
      </div>

      {/* Previsualización de video */}
      {videoUrl && !previewError && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Previsualización:</h4>
          <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
            {videoUrl.includes('youtube') || videoUrl.includes('vimeo') ? (
              <iframe
                src={getEmbedUrl(videoUrl)}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full object-contain"
              >
                Tu navegador no soporta la reproducción de videos.
              </video>
            )}
          </div>
        </div>
      )}

      {/* Campos específicos de metadatos de video */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label htmlFor="video-description" className="block text-sm font-medium text-gray-700 mb-1">
            Transcripción (opcional)
          </label>
          <textarea
            id="video-description"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Transcripción del contenido del video..."
            onChange={(e) => {
              const transcription = e.target.value;
              // Actualizar el contentBody con los metadatos del video
              onChange({
                contentBody: {
                  ...data.contentBody,
                  transcription
                }
              });
            }}
            value={data.contentBody?.transcription || ''}
          ></textarea>
          <p className="mt-1 text-xs text-gray-500">
            La transcripción ayuda a la accesibilidad y a la búsqueda del contenido.
          </p>
        </div>
      </div>
    </div>
  );
}