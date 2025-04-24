// src/app/api/secuencias/[id]/contents/[positionId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// Actualizar un contenido en la secuencia
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; positionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id, positionId } = params;
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

    // Verificar si la posición existe
    const existingPosition = await prisma.sequencePosition.findFirst({
      where: {
        id: positionId,
        sequenceId: id
      }
    });

    if (!existingPosition) {
      return NextResponse.json({ error: 'Contenido no encontrado en la secuencia' }, { status: 404 });
    }

    // Preparar datos para actualizar
    const data: any = {};
    
    // Solo permitir actualizar isOptional por ahora
    if (typeof body.isOptional === 'boolean') {
      data.isOptional = body.isOptional;
    }

    // Si se proporciona position, actualizarla
    if (typeof body.position === 'number' && body.position > 0) {
      data.position = body.position;
    }

    // Actualizar la posición
    const updatedPosition = await prisma.sequencePosition.update({
      where: { id: positionId },
      data
    });

    return NextResponse.json(updatedPosition);
  } catch (error) {
    console.error('Error al actualizar contenido en secuencia:', error);
    return NextResponse.json(
      { error: 'Error al actualizar contenido en secuencia' },
      { status: 500 }
    );
  }
}

// Eliminar un contenido de la secuencia
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; positionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id, positionId } = params;

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

    // Verificar si la posición existe
    const existingPosition = await prisma.sequencePosition.findFirst({
      where: {
        id: positionId,
        sequenceId: id
      }
    });

    if (!existingPosition) {
      return NextResponse.json({ error: 'Contenido no encontrado en la secuencia' }, { status: 404 });
    }

    // Eliminar la posición
    await prisma.sequencePosition.delete({
      where: { id: positionId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar contenido de secuencia:', error);
    return NextResponse.json(
      { error: 'Error al eliminar contenido de secuencia' },
      { status: 500 }
    );
  }
}