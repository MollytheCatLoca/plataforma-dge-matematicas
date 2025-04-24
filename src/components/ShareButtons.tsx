'use client';

import React, { useState } from 'react';

interface ShareButtonsProps {
  title?: string;
  description?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ 
  title = 'Contenido educativo',
  description = 'Revisa este contenido educativo de la plataforma DGE Matemáticas'
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Función para compartir vía navegador Web Share API si está disponible
  const handleShare = async () => {
    const shareData = { 
      title, 
      text: description, 
      url: window.location.href 
    };
    if (typeof navigator.share !== 'undefined') {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error al compartir:', error);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      handleCopyToClipboard();
    }
  };
  
  // Función para copiar el enlace al portapapeles
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    }).catch(err => {
      console.error('Error al copiar:', err);
    });
  };
  
  // Función para compartir en redes sociales específicas
  const handleShareOn = (platform: string) => {
    let shareUrl = '';
    const encodedUrl = encodeURIComponent(window.location.href);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20-%20${encodedDescription}%20${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%20${encodedUrl}`;
        break;
      default:
        return;
    }
    
    // Abrir ventana de compartir
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };
  
  return (
    <div className="relative inline-block">
      <div className="flex space-x-2">
        {/* Botón principal de compartir */}
        <button
          onClick={handleShare}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-semibold shadow"
          aria-label="Compartir contenido"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Compartir
        </button>
        
        {/* Botones de redes sociales específicas */}
        <div className="flex space-x-1">
          {/* WhatsApp */}
          <button
            onClick={() => handleShareOn('whatsapp')}
            className="p-2 bg-[#25D366] text-white rounded-full hover:bg-[#128C7E] transition shadow"
            aria-label="Compartir en WhatsApp"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </button>
          
          {/* Twitter */}
          <button
            onClick={() => handleShareOn('twitter')}
            className="p-2 bg-[#1DA1F2] text-white rounded-full hover:bg-[#0c85d0] transition shadow"
            aria-label="Compartir en Twitter"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </button>
          
          {/* Email */}
          <button
            onClick={() => handleShareOn('email')}
            className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition shadow"
            aria-label="Compartir por correo"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </button>
          
          {/* Copiar enlace */}
          <button
            onClick={handleCopyToClipboard}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow relative"
            aria-label="Copiar enlace"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
            
            {showTooltip && (
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                ¡Enlace copiado!
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareButtons;