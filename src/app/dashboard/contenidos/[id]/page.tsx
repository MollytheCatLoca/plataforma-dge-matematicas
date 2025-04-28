// src/app/dashboard/contenidos/[id]/page.tsx

import Link from 'next/link';
import React from 'react';
import ContentViewer from '@/components/contenidos/ContentViewer';
import { Content } from 'next/font/google';


interface PageProps {
  params: { id: string };
}

export default async function ContentDetailPage({ params }: PageProps) {
  const { id } = params;

  // Fetch en el servidor, sin cache para asegurar datos frescos
  const res = await fetch(`http://localhost:3000/api/contenidos/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return (
      <div className="p-8 text-center text-red-600">
        Error al cargar el contenido ({res.status})
      </div>
    );
  }

  const content = await res.json();

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/contenidos" className="mr-4 text-blue-600">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold">{content.title}</h1>
      </div>

     

      <ContentViewer content={content} />
    </div>
  );
}
