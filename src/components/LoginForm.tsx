// src/components/LoginForm.tsx
'use client'; 

import { useState } from 'react';
import { authenticate } from '@/app/login/actions'; // ¡Importa la acción!
import Link from 'next/link'; // Para los enlaces inferiores

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleServerAction(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const result = await authenticate(email, password);
    if (result?.error) setError(result.error);
    else if (result?.success) window.location.href = '/dashboard';
    else setError('Respuesta inesperada del servidor.');
    setIsLoading(false);
  }

  return (
    <form action={handleServerAction} className="space-y-4">
      {error && (
        <div className="p-3 my-2 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo Electrónico
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="tu@email.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="••••••••"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 transition duration-300'
          }`}
        >
          {isLoading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </div>
      <div className="text-sm text-center">
        <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      <div className="text-sm text-center">
        <span className="text-gray-600">¿No tienes cuenta? </span>
        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
          Registrate
        </Link>
      </div>
    </form>
  );
}