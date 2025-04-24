// src/app/api/curriculum-nodes/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// Obtener todos los nodos curriculares
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Filtros por query params
    const { searchParams } = new URL(request.url);
    const nodeType = searchParams.get('type');
    const parentId = searchParams.get('parent');
    const gradeLevel = searchParams.get('grade');

    // Construir consulta
    const query: any = {};
    
    if (nodeType) {
      query.nodeType = nodeType;
    }
    
    if (parentId) {
      query.parentId = parentId;
    }
    
    if (gradeLevel) {
      query.gradeLevel = { has: gradeLevel };
    }

    const nodes = await prisma.curriculumNode.findMany({
      where: query,
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ],
      include: {
        parent: {
          select: { name: true }
        },
        _count: {
          select: { children: true }
        }
      }
    });

    return NextResponse.json(nodes);
  } catch (error) {
    console.error('Error al obtener nodos curriculares:', error);
    return NextResponse.json(
      { error: 'Error al obtener nodos curriculares' },
      { status: 500 }
    );
  }
}