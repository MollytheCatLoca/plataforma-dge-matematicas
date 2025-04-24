// src/app/api/secuencias/[id]/contents/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// Agregar un contenido a una secuencia
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Corregir: usar el id de los parámetros de forma segura
    const id = params.id;
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

    // Validar datos del contenido
    if (!body.contentResourceId) {
      return NextResponse.json({ error: 'ID del contenido es obligatorio' }, { status: 400 });
    }

    // Verificar si el contenido existe
    const contentExists = await prisma.contentResource.findUnique({
      where: { id: body.contentResourceId }
    });

    if (!contentExists) {
      return NextResponse.json({ error: 'El contenido no existe' }, { status: 400 });
    }

    // Verificar si el contenido ya está en la secuencia
    const existingPosition = await prisma.sequencePosition.findFirst({
      where: {
        sequenceId: id,
        contentResourceId: body.contentResourceId
      }
    });

    if (existingPosition) {
      return NextResponse.json({ 
        error: 'Este contenido ya está en la secuencia' 
      }, { status: 400 });
    }

    // Crear posición para el contenido
    const position = body.position || 1;
    const isOptional = body.isOptional || false;

    const sequencePosition = await prisma.sequencePosition.create({
      data: {
        sequenceId: id,
        contentResourceId: body.contentResourceId,
        position,
        isOptional
      }
    });

    return NextResponse.json(sequencePosition, { status: 201 });
  } catch (error) {
    console.error('Error al agregar contenido a secuencia:', error);
    return NextResponse.json(
      { error: 'Error al agregar contenido a secuencia' },
      { status: 500 }
    );
  }
}