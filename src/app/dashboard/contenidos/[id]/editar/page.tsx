// src/app/dashboard/contenidos/[id]/editar/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect, notFound } from 'next/navigation';
import { UserRole } from '@prisma/client';
import prisma from '@/lib/prisma';
import ContentForm from '@/components/contenidos/ContentForm';
import Link from 'next/link';

interface EditarContenidoPageProps {
  params: {
    id: string;
  };
}

export default async function EditarContenidoPage({ params }: EditarContenidoPageProps) {
  // Verificar autenticación
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // Solo ciertos roles pueden editar contenido
  if (![UserRole.TEACHER, UserRole.SCHOOL_ADMIN, UserRole.DGE_ADMIN].includes(session.user.role as UserRole)) {
    return (
      <div className="container mx-auto p-6 bg-red-50 border border-red-200 rounded-lg mt-8">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Acceso Denegado</h1>
        <p className="text-red-600 mb-4">
          No tienes permisos para editar contenido en la plataforma.
        </p>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  // Obtener el contenido a editar
  const content = await prisma.contentResource.findUnique({
    where: { id: params.id }
  });

  // Si no existe, mostrar 404
  if (!content) {
    notFound();
  }

  // Verificar permisos: solo el creador o administradores pueden editar
  const isOwner = content.createdById === session.user.id;
  const isAdmin = [UserRole.SCHOOL_ADMIN, UserRole.DGE_ADMIN].includes(session.user.role as UserRole);
  
  if (!isOwner && !isAdmin) {
    return (
      <div className="container mx-auto p-6 bg-red-50 border border-red-200 rounded-lg mt-8">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Acceso Denegado</h1>
        <p className="text-red-600 mb-4">
          No tienes permisos para editar este contenido específico.
        </p>
        <Link href={`/dashboard/contenidos/${params.id}`} className="text-blue-600 hover:underline">
          Volver a Ver Contenido
        </Link>
      </div>
    );
  }

  // Preparar datos iniciales para el formulario
  const initialData = {
    title: content.title,
    description: content.description || '',
    summary: content.summary || '',
    type: content.type,
    status: content.status,
    contentUrl: content.contentUrl || '',
    imageUrl: content.imageUrl || '',
    contentBody: content.contentBody,
    tags: content.tags || [],
    gradeLevels: content.gradeLevels || [],
    curriculumNodeId: content.curriculumNodeId || '',
    authorName: content.authorName || '',
    duration: content.duration || 0,
    visibility: content.visibility || 'public'
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link 
            href={`/dashboard/contenidos/${params.id}`} 
            className="mr-4 p-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Editar Contenido</h1>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/contenidos/${params.id}`}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-gray-600 mb-4">
          Edita los detalles del contenido. Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
        </p>
        
        <ContentForm 
          initialData={initialData} 
          contentId={params.id} 
          isEditing={true}
        />
      </div>
    </div>
  );
}