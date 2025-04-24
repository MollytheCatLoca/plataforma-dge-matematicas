// src/components/dashboard/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { 
  Home, 
  Book, 
  Users, 
  BarChart3, 
  Settings, 
  School,
  Calendar,
  FileText,
  ListTree,  // Añadido para el ícono de Curriculum
  Layers,     // Añadido para el ícono de Secuencias
  LogOut 
} from 'lucide-react'; 

// Define los módulos con sus rutas e iconos
const commonModules = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
];

const roleSpecificModules = {
  DGE_ADMIN: [
    { name: 'Escuelas', href: '/dashboard/escuelas', icon: School },
    { name: 'Curriculum', href: '/dashboard/curriculum', icon: ListTree }, // Añadida esta línea
    { name: 'Secuencias', href: '/dashboard/secuencias', icon: Layers }, // Añadida esta línea
    { name: 'Reportes', href: '/dashboard/reportes', icon: BarChart3 },
    { name: 'Usuarios', href: '/dashboard/usuarios', icon: Users },
  ],
  SCHOOL_ADMIN: [
    { name: 'Docentes', href: '/dashboard/docentes', icon: Users },
    { name: 'Estudiantes', href: '/dashboard/estudiantes', icon: Users },
    { name: 'Curriculum', href: '/dashboard/curriculum', icon: ListTree }, // Añadida esta línea
    { name: 'Secuencias', href: '/dashboard/secuencias', icon: Layers }, // Añadida esta línea
    { name: 'Clases', href: '/dashboard/clases', icon: Calendar },
    { name: 'Reportes', href: '/dashboard/reportes', icon: BarChart3 },
  ],
  TEACHER: [
    { name: 'Mis Clases', href: '/dashboard/mis-clases', icon: Calendar },
    { name: 'Contenidos', href: '/dashboard/contenidos', icon: Book },
    { name: 'Secuencias', href: '/dashboard/secuencias', icon: Layers }, // Añadida esta línea
    { name: 'Evaluaciones', href: '/dashboard/evaluaciones', icon: FileText },
    { name: 'Estudiantes', href: '/dashboard/mis-estudiantes', icon: Users },
  ],
  STUDENT: [
    { name: 'Mis Clases', href: '/dashboard/mis-clases', icon: Calendar },
    { name: 'Tareas', href: '/dashboard/tareas', icon: FileText },
    { name: 'Materiales', href: '/dashboard/materiales', icon: Book },
    { name: 'Contenidos', href: '/dashboard/contenidos', icon: Book },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Obtiene los módulos específicos según el rol del usuario
  const userRole = session?.user?.role || 'STUDENT';
  const modules = [...commonModules, ...(roleSpecificModules[userRole as keyof typeof roleSpecificModules] || [])];
  
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold">Plataforma DGE</h2>
        <p className="text-sm text-gray-400 mt-1">Matemáticas</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="pb-4">
          <p className="text-xs uppercase text-gray-500 font-semibold tracking-wider mb-2">
            Navegación
          </p>
          <ul className="space-y-1">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = pathname === module.href || pathname.startsWith(`${module.href}/`);
              
              return (
                <li key={module.name}>
                  <Link
                    href={module.href}
                    className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {module.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="pt-4 border-t border-gray-700">
          <ul className="space-y-1">
            <li>
              <Link
                href="/dashboard/configuracion"
                className={`flex items-center px-3 py-2 rounded-md transition-colors
                  ${pathname === '/dashboard/configuracion' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <Settings className="h-5 w-5 mr-3" />
                Configuración
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}