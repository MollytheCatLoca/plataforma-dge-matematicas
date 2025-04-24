// src/components/Navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!session) return null;

  return (
    <nav className="bg-blue-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="font-bold text-xl">Plataforma DGE</span>
          </div>
          
          {/* Menú para móviles */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Menú para desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/dashboard" 
              className={`px-3 py-2 rounded hover:bg-blue-700 ${pathname === '/dashboard' ? 'bg-blue-700' : ''}`}
            >
              Inicio
            </Link>
            
            <Link 
              href="/contenidos" 
              className={`px-3 py-2 rounded hover:bg-blue-700 ${pathname.startsWith('/contenidos') ? 'bg-blue-700' : ''}`}
            >
              Contenidos
            </Link>
            
            {/* Opciones específicas por rol */}
            {session.user.role !== 'STUDENT' && (
              <>
                <Link 
                  href="/clases" 
                  className={`px-3 py-2 rounded hover:bg-blue-700 ${pathname.startsWith('/clases') ? 'bg-blue-700' : ''}`}
                >
                  Clases
                </Link>
                
                <Link 
                  href="/evaluaciones" 
                  className={`px-3 py-2 rounded hover:bg-blue-700 ${pathname.startsWith('/evaluaciones') ? 'bg-blue-700' : ''}`}
                >
                  Evaluaciones
                </Link>
              </>
            )}
            
            {/* Perfil y opciones de usuario */}
            <div className="relative">
              <button 
                className="flex items-center px-3 py-2 rounded hover:bg-blue-700"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="mr-2">{session.user.firstName}</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700">
                  <Link 
                    href="/perfil" 
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Mi Perfil
                  </Link>
                  <Link 
                    href="/api/auth/signout" 
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Cerrar Sesión
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Menú móvil expandido */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/dashboard" 
              className={`block px-3 py-2 rounded ${pathname === '/dashboard' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
            >
              Inicio
            </Link>
            
            <Link 
              href="/contenidos" 
              className={`block px-3 py-2 rounded ${pathname.startsWith('/contenidos') ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
            >
              Contenidos
            </Link>
            
            {session.user.role !== 'STUDENT' && (
              <>
                <Link 
                  href="/clases" 
                  className={`block px-3 py-2 rounded ${pathname.startsWith('/clases') ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                >
                  Clases
                </Link>
                
                <Link 
                  href="/evaluaciones" 
                  className={`block px-3 py-2 rounded ${pathname.startsWith('/evaluaciones') ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                >
                  Evaluaciones
                </Link>
              </>
            )}
            
            <Link 
              href="/perfil" 
              className="block px-3 py-2 rounded hover:bg-blue-700"
            >
              Mi Perfil
            </Link>
            
            <Link 
              href="/api/auth/signout" 
              className="block px-3 py-2 rounded hover:bg-blue-700"
            >
              Cerrar Sesión
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}