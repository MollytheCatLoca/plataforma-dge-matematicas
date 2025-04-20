// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard Principal</h1>
      <p className="text-gray-600 mb-6">Bienvenido a la plataforma, {session.user.firstName}.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Actividad Reciente</h2>
          <p className="text-gray-600">No hay actividad reciente para mostrar.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Recordatorios</h2>
          <p className="text-gray-600">No hay recordatorios pendientes.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Estadísticas</h2>
          <p className="text-gray-600">Próximamente disponibles.</p>
        </div>
      </div>
    </div>
  );
}