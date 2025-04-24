'use client';

import React, { useState, useRef, useEffect } from 'react';
import MathRenderer from './MathRenderer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ContentAssistantProps {
  contentText: string;
}

export default function ContentAssistant({ contentText }: ContentAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final de los mensajes cuando se añade uno nuevo
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus en el input cuando el componente se monta
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const sendMessage = async (e?: React.FormEvent) => {
    // Prevenir comportamiento por defecto si viene de un envío de formulario
    if (e) e.preventDefault();
    
    // No hacer nada si el input está vacío o si estamos cargando
    if (!input.trim() || loading) return;
    
    const userMsg: Message = { role: 'user', content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    
    try {
      // En tu implementación, el endpoint es /api/content-assistant
      // Por consistencia con el código anterior, usaré /api/explain-content
      const res = await fetch('/api/content-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contentText, 
          messages: updated.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });
      
      if (!res.ok) {
        throw new Error(`Error en la solicitud: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.reply && data.reply.content) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.reply.content 
        }]);
      } else {
        // Mensaje por defecto si no hay respuesta válida
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Lo siento, no pude generar una respuesta en este momento. Por favor, intenta de nuevo.' 
        }]);
      }
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      // Mensaje de error para el usuario
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Ocurrió un error al procesar tu pregunta. Por favor, intenta de nuevo más tarde.' 
      }]);
    } finally {
      setLoading(false);
      // Enfocar el input después de enviar
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Manejar tecla Enter para enviar
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Calcular clase para el contenedor del chat según el número de mensajes
  const chatContainerClass = `max-h-80 overflow-y-auto space-y-4 mb-4 p-3 ${
    messages.length > 0 ? 'bg-white rounded-lg shadow-inner' : ''
  }`;

  return (
    <div className="border rounded-lg p-4 bg-gray-50 shadow-md">
      <h3 className="font-semibold text-lg mb-3 text-blue-700 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        Asistente de contenido
      </h3>
      
      <div 
        ref={chatContainerRef}
        className={chatContainerClass}
      >
        {messages.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>Haz una pregunta sobre este contenido para comenzar la conversación.</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div 
              key={i} 
              className={`p-3 rounded-lg ${
                m.role === 'assistant' 
                  ? 'bg-blue-50 border-l-4 border-blue-400' 
                  : 'bg-gray-100 border-l-4 border-gray-400'
              }`}
            >
              <div className="font-semibold text-xs text-gray-500 mb-1">
                {m.role === 'assistant' ? 'Tutor' : 'Tú'}
              </div>
              {m.role === 'assistant' ? (
                <MathRenderer text={m.content} />
              ) : (
                <div>{m.content}</div>
              )}
            </div>
          ))
        )}
        
        {loading && (
          <div className="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-400 animate-pulse">
            <div className="font-semibold text-xs text-gray-500 mb-1">Tutor</div>
            <div className="flex space-x-2 items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
              <span className="text-sm text-gray-500">Escribiendo...</span>
            </div>
          </div>
        )}
        
        {/* Elemento invisible para el auto-scroll */}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pregunta sobre este contenido..."
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-opacity hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
        >
          Enviar
        </button>
      </form>
      
      {/* Indicador opcional de ayuda */}
      {messages.length === 0 && (
        <div className="mt-3 text-xs text-gray-500">
          Ejemplos: "¿Puedes explicarme este concepto?", "¿Cómo resuelvo este tipo de problemas?"
        </div>
      )}
    </div>
  );
}