// src/app/dashboard/contenidos/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ContentList from '@/components/contenidos/ContentList';

export default async function ContenidosPage() {
  // Verificar autenticación
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contenidos</h1>
        <p className="text-gray-600 mt-1">
          Explora los recursos educativos disponibles en la plataforma.
        </p>
      </div>

      <ContentList />
    </div>
  );
}