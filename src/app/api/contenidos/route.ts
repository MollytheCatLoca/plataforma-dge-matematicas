// src/app/api/contenidos/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { ContentStatus } from '@prisma/client';

// Obtener contenidos disponibles (para agregar a secuencias)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Filtros por query params
    const { searchParams } = new URL(request.url);
    const exclude = searchParams.get('exclude');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'PUBLISHED';
    const curriculumNodeId = searchParams.get('node');

    // Construir consulta
    const query: any = {};
    
    // Solo mostrar contenidos publicados por defecto
    if (status) {
      query.status = status;
    }
    
    // Filtrar por tipo
    if (type) {
      query.type = type;
    }
    
    // Filtrar por nodo curricular
    if (curriculumNodeId) {
      query.curriculumNodeId = curriculumNodeId;
    }
    
    // Excluir contenidos ya incluidos en una secuencia
    if (exclude) {
      const excludeIds = exclude.split(',');
      query.id = { notIn: excludeIds };
    }
    
    // Búsqueda por texto
    if (search) {
      query.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { array_contains: search } }
      ];
    }

    const contenidos = await prisma.contentResource.findMany({
      where: query,
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        description: true,
        curriculumNode: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        title: 'asc'
      },
      take: 100 // Limitar para evitar resultados muy grandes
    });

    return NextResponse.json(contenidos);
  } catch (error) {
    console.error('Error al obtener contenidos:', error);
    return NextResponse.json(
      { error: 'Error al obtener contenidos' },
      { status: 500 }
    );
  }
}

// El endpoint está correcto y no se realizaron cambios.