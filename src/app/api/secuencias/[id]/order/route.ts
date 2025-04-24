// src/app/api/secuencias/[id]/order/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// Actualizar el orden de los contenidos en la secuencia
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
        },
        contents: true
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

    // Validar datos
    if (!body.positions || !Array.isArray(body.positions) || body.positions.length === 0) {
      return NextResponse.json({ error: 'Formato de posiciones inválido' }, { status: 400 });
    }

    // Verificar que todas las posiciones pertenezcan a la secuencia
    const existingPositionIds = existingSequence.contents.map(p => p.id);
    const requestedPositionIds = body.positions.map((p: any) => p.id);

    const invalidPositions = requestedPositionIds.filter(id => !existingPositionIds.includes(id));
    if (invalidPositions.length > 0) {
      return NextResponse.json(
        { error: 'Algunas posiciones no pertenecen a esta secuencia' },
        { status: 400 }
      );
    }

    // Actualizar las posiciones en una transacción
    const updates = await prisma.$transaction(
      body.positions.map((item: { id: string; position: number }) => 
        prisma.sequencePosition.update({
          where: { id: item.id },
          data: { position: item.position }
        })
      )
    );

    return NextResponse.json({ success: true, updates });
  } catch (error) {
    console.error('Error al actualizar orden en secuencia:', error);
    return NextResponse.json(
      { error: 'Error al actualizar orden en secuencia' },
      { status: 500 }
    );
  }
}