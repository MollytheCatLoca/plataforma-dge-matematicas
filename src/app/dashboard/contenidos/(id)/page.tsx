// src/app/(dashboard)/contenidos/[id]/page.tsx
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import MathRenderer from '@/components/MathRenderer';

interface ContentDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
  // Obtener el recurso de contenido por ID
  const contentResource = await prisma.contentResource.findUnique({
    where: { id: params.id },
  });

  // Si no se encuentra el recurso, mostrar 404
  if (!contentResource) {
    notFound();
  }

  // Obtener el contenido que se mostrará (puede estar en description o contentBody)
  const contentToDisplay = 
    contentResource.contentBody 
      ? typeof contentResource.contentBody === 'object'
        ? JSON.stringify(contentResource.contentBody)
        : contentResource.contentBody.toString()
      : contentResource.description || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-blue-800">
          {contentResource.title}
        </h1>
        
        <div className="prose max-w-none">
          {/* Renderizar el contenido con MathRenderer */}
          <MathRenderer text={contentToDisplay} />
        </div>

        {/* Información adicional */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Tipo: {contentResource.type}
          </p>
          <p className="text-sm text-gray-600">
            Estado: {contentResource.status}
          </p>
        </div>
      </div>
    </div>
  );
}