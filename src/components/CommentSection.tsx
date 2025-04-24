'use client';

import React, { useState, useEffect, FormEvent } from 'react';

// Tipos para los datos
interface CommentAuthor {
  id: string;
  firstName: string;
  lastName: string;
}

interface Comment {
  id: string;
  text: string;
  rating: number | null;
  createdAt: string;
  author: CommentAuthor;
}

interface CommentSectionProps {
  contentId: string;
}

export default function CommentSection({ contentId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [newRating, setNewRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar comentarios iniciales
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/content/${contentId}/comments`);
        if (!response.ok) {
          throw new Error('Error al cargar comentarios');
        }
        const data: Comment[] = await response.json();
        setComments(data);
      } catch (err: any) {
        setError(err.message || 'Ocurrió un error inesperado');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [contentId]);

  // Manejar envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      setSubmitError('El comentario no puede estar vacío.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`/api/content/${contentId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newCommentText, rating: newRating }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar comentario');
      }

      const addedComment: Comment = await response.json();
      setComments([addedComment, ...comments]); // Añadir al inicio de la lista
      setNewCommentText('');
      setNewRating(null);
    } catch (err: any) {
      setSubmitError(err.message || 'Ocurrió un error inesperado al enviar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Comentarios y Valoraciones</h2>

      {/* Formulario para nuevo comentario */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">Dejá tu comentario</h3>
        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Escribí tu opinión sobre este contenido..."
          className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-blue-300 focus:outline-none"
          rows={3}
          disabled={isSubmitting}
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Valoración (opcional):</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star === newRating ? null : star)} // Permite deseleccionar
                  className={`text-2xl ${newRating && star <= newRating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-500 transition disabled:opacity-50`}
                  disabled={isSubmitting}
                  aria-label={`Valorar con ${star} estrella${star > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Comentario'}
          </button>
        </div>
        {submitError && <p className="text-red-600 text-sm mt-2">{submitError}</p>}
      </form>

      {/* Lista de comentarios existentes */}
      {isLoading && <p className="text-gray-500">Cargando comentarios...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {!isLoading && !error && comments.length === 0 && (
        <p className="text-gray-500 italic">Todavía no hay comentarios. ¡Sé el primero!</p>
      )}
      {!isLoading && !error && comments.length > 0 && (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 border rounded-lg bg-white shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-800">
                  {comment.author.firstName} {comment.author.lastName}
                </p>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {comment.rating && (
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-xl ${star <= comment.rating! ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </span>
                  ))}
                </div>
              )}
              <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
