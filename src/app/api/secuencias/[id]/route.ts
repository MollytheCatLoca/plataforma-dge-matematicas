// src/app/api/secuencias/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// Obtener una secuencia por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = params;

    const secuencia = await prisma.learningSequence.findUnique({
      where: { id },
      include: {
        curriculumNode: true,
        createdBy: {
          select: { 
            firstName: true, 
            lastName: true,
            email: true
          }
        },
        contents: {
          include: {
            contentResource: {
              select: {
                id: true,
                title: true,
                type: true,
                status: true,
                description: true
              }
            }
          },
          orderBy: {
            position: 'asc'
          }
        }
      }
    });

    if (!secuencia) {
      return NextResponse.json({ error: 'Secuencia no encontrada' }, { status: 404 });
    }

    return NextResponse.json(secuencia);
  } catch (error) {
    console.error('Error al obtener secuencia:', error);
    return NextResponse.json(
      { error: 'Error al obtener secuencia' },
      { status: 500 }
    );
  }
}

// Actualizar una secuencia
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Verificar si la secuencia existe
    const existingSequence = await prisma.learningSequence.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { email: true }
        }
      }
    });

    if (!existingSequence) {
      return NextResponse.json({ error: 'Secuencia no encontrada' }, { status: 404 });
    }

    // Verificar permisos
    const isOwner = existingSequence.createdBy.email === session.user.email;
    const isAdminOrSchoolAdmin = [UserRole.DGE_ADMIN, UserRole.SCHOOL_ADMIN].includes(session.user.role);

    if (!isOwner && !isAdminOrSchoolAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar esta secuencia' },
        { status: 403 }
      );
    }

    // Validar datos mínimos
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    // Preparar datos para actualizar
    const data: any = {
      name: body.name.trim(),
      description: body.description?.trim() || null,
      isTemplate: body.isTemplate || false,
    };

    // Actualizar curriculumNodeId
    if (body.curriculumNodeId === null) {
      data.curriculumNodeId = null;
    } else if (body.curriculumNodeId && body.curriculumNodeId.trim() !== '') {
      // Verificar si el nodo existe
      const nodeExists = await prisma.curriculumNode.findUnique({
        where: { id: body.curriculumNodeId }
      });

      if (!nodeExists) {
        return NextResponse.json(
          { error: 'El nodo curricular especificado no existe' },
          { status: 400 }
        );
      }

      data.curriculumNodeId = body.curriculumNodeId;
    }

    // Actualizar la secuencia
    const updatedSequence = await prisma.learningSequence.update({
      where: { id },
      data
    });

    return NextResponse.json(updatedSequence);
  } catch (error) {
    console.error('Error al actualizar secuencia:', error);
    return NextResponse.json(
      { error: 'Error al actualizar secuencia' },
      { status: 500 }
    );
  }
}

// Eliminar una secuencia
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = params;

    // Verificar si la secuencia existe
    const existingSequence = await prisma.learningSequence.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { email: true }
        }
      }
    });

    if (!existingSequence) {
      return NextResponse.json({ error: 'Secuencia no encontrada' }, { status: 404 });
    }

    // Verificar permisos
    const isOwner = existingSequence.createdBy.email === session.user.email;
    const isAdminOrSchoolAdmin = [UserRole.DGE_ADMIN, UserRole.SCHOOL_ADMIN].includes(session.user.role);

    if (!isOwner && !isAdminOrSchoolAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar esta secuencia' },
        { status: 403 }
      );
    }

    // Eliminar primero las posiciones asociadas (esto es importante para respetar las restricciones de clave foránea)
    await prisma.sequencePosition.deleteMany({
      where: { sequenceId: id }
    });

    // Luego eliminar la secuencia
    await prisma.learningSequence.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar secuencia:', error);
    return NextResponse.json(
      { error: 'Error al eliminar secuencia' },
      { status: 500 }
    );
  }
}