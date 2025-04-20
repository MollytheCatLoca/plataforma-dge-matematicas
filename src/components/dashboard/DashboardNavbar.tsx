// src/components/dashboard/DashboardNavbar.tsx (actualizando los enlaces)
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { UserRole } from '@prisma/client';
import { Menu, Bell, ChevronDown } from 'lucide-react';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  schoolId?: string;
};

interface DashboardNavbarProps {
  user: User;
}

export default function DashboardNavbar({ user }: DashboardNavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Traducir el rol para mostrar en español
  const roleMap = {
    DGE_ADMIN: 'Administrador DGE',
    SCHOOL_ADMIN: 'Administrador Escolar',
    TEACHER: 'Docente',
    STUDENT: 'Estudiante'
  };
  
  const userRoleDisplay = roleMap[user.role as keyof typeof roleMap] || user.role;
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Botón de menú móvil (visible solo en pantallas pequeñas) */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Abrir menú lateral</span>
              <Menu className="h-6 w-6" />
            </button>
          </div>
          
          {/* Título de sección */}
          <div className="hidden md:flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
          </div>
          
          {/* Acciones y perfil del usuario */}
          <div className="flex items-center space-x-4">
            {/* Icono de notificaciones */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-1 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="sr-only">Ver notificaciones</span>
                <Bell className="h-6 w-6" />
              </button>
              {/* Indicador de notificaciones (ejemplo) */}
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              
              {/* Panel de notificaciones */}
              {isNotificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
                    <div className="mt-2 py-2 text-sm text-gray-500">
                      No tienes notificaciones nuevas.
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Menú de perfil del usuario */}
            <div className="relative ml-3">
              <div>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 p-1"
                >
                  <span className="sr-only">Abrir menú de usuario</span>
                  
                  {/* Avatar del usuario */}
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    {user.firstName.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Nombre e información del usuario (visible en pantallas medianas o más grandes) */}
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-700">{user.firstName} {user.lastName}</span>
                    <span className="text-xs text-gray-500">{userRoleDisplay}</span>
                  </div>
                  
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              
              {/* Panel desplegable del perfil */}
              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs text-gray-500">
                      Conectado como<br />
                      <span className="font-medium text-gray-900">{user.email}</span>
                    </div>
                    <Link
                      href="/dashboard/perfil"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      href="/dashboard/configuracion"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Configuración
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}