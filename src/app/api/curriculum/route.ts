// src/app/api/curriculum/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const nodes = await prisma.curriculumNode.findMany({
      orderBy: [
        { parentId: 'asc' },
        { order: 'asc' }
      ],
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(nodes);
  } catch (error) {
    console.error('Error fetching curriculum nodes:', error);
    return NextResponse.json({ error: 'Error al obtener nodos curriculares' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // Verificar permisos
  if (![UserRole.DGE_ADMIN, UserRole.SCHOOL_ADMIN].includes(session.user.role as UserRole)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const data = await request.json();
    
    // Validaciones básicas
    if (!data.name || data.name.trim() === '') {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    // Crear nodo
    const node = await prisma.curriculumNode.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim(),
        nodeType: data.nodeType,
        parentId: data.parentId || null,
        order: data.order || null,
        gradeLevel: data.gradeLevel || []
      }
    });

    return NextResponse.json(node, { status: 201 });
  } catch (error) {
    console.error('Error creating curriculum node:', error);
    return NextResponse.json({ error: 'Error al crear nodo curricular' }, { status: 500 });
  }
}