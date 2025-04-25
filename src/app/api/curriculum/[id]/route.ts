// src/app/api/curriculum/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// Obtener un nodo curricular por su ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const node = await prisma.curriculumNode.findUnique({
      where: { id: params.id },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!node) {
      return NextResponse.json({ error: 'Nodo no encontrado' }, { status: 404 });
    }

    return NextResponse.json(node);
  } catch (error) {
    console.error('Error obteniendo nodo curricular:', error);
    return NextResponse.json({ error: 'Error al obtener el nodo curricular' }, { status: 500 });
  }
}

// Actualizar un nodo curricular
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // Verificar permisos
  if (![UserRole.DGE_ADMIN, UserRole.SCHOOL_ADMIN].includes(session.user.role as UserRole)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const id = params.id;
    const data = await request.json();

    // Validaciones básicas
    if (!data.name || data.name.trim() === '') {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    // Preparar datos para actualizar
    const updateData: any = {
      name: data.name.trim(),
      description: data.description?.trim(),
      nodeType: data.nodeType,
      order: data.order || null,
      gradeLevel: data.gradeLevel || []
    };

    // Actualizar parentId solo si se proporciona explícitamente
    if (data.parentId !== undefined) {
      // Evitar ciclos (un nodo no puede ser su propio padre)
      if (data.parentId === id) {
        return NextResponse.json({ error: 'Un nodo no puede ser su propio padre' }, { status: 400 });
      }
      updateData.parentId = data.parentId || null;
    }

    // Actualizar nodo
    const updatedNode = await prisma.curriculumNode.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedNode);
  } catch (error) {
    console.error('Error actualizando nodo curricular:', error);
    return NextResponse.json({ error: 'Error al actualizar el nodo curricular' }, { status: 500 });
  }
}

// Eliminar un nodo curricular
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // Verificar permisos
  if (![UserRole.DGE_ADMIN, UserRole.SCHOOL_ADMIN].includes(session.user.role as UserRole)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    // Verificar si tiene contenidos asociados
    const contentCount = await prisma.contentResource.count({
      where: { curriculumNodeId: params.id }
    });

    if (contentCount > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar el nodo porque tiene contenidos asociados' 
      }, { status: 400 });
    }

    // Verificar si tiene hijos
    const childrenCount = await prisma.curriculumNode.count({
      where: { parentId: params.id }
    });

    if (childrenCount > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar el nodo porque tiene nodos hijos' 
      }, { status: 400 });
    }

    // Eliminar prerrequisitos asociados
    await prisma.curriculumNodePrerequisite.deleteMany({
      where: {
        OR: [
          { nodeId: params.id },
          { prerequisiteId: params.id }
        ]
      }
    });

    // Eliminar el nodo
    await prisma.curriculumNode.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando nodo curricular:', error);
    return NextResponse.json({ error: 'Error al eliminar el nodo curricular' }, { status: 500 });
  }
}