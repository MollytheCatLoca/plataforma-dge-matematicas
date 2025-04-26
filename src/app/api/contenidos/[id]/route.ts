// src/app/api/contenidos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import {
  ContentStatus,
  ContentType,
  GradeLevel,
  UserRole,
} from '@prisma/client';
import { z } from 'zod';

/* ------------------------------------------------------------------ */
/*  Configuración                                                     */
/* ------------------------------------------------------------------ */
export const dynamic = 'force-dynamic'; // evita SSG y asegura runtime server

const ContentSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  type: z.nativeEnum(ContentType),
  status: z.nativeEnum(ContentStatus),
  contentUrl: z.string().url().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  contentBody: z.any().optional(),
  tags: z.array(z.string()).default([]),
  gradeLevels: z.array(z.nativeEnum(GradeLevel)).default([]),
  curriculumNodeId: z.string().nullable().optional(),
  authorName: z.string().optional(),
  duration: z.number().int().positive().nullable().optional(),
  visibility: z.enum(['public', 'private', 'restricted']).default('public'),
});

function assertAuth(session: any) {
  if (!session)
    throw NextResponse.json({ error: 'No autenticado' }, { status: 401 });
}

/* ------------------------------------------------------------------ */
/*  GET /api/contenidos/[id]                                          */
/* ------------------------------------------------------------------ */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;            // ← esperar params
  const session = await getServerSession(authOptions);
  assertAuth(session);

  const where: any = { id };
  if (session.user.role === UserRole.STUDENT)
    where.status = ContentStatus.PUBLISHED;

  const content = await prisma.contentResource.findUnique({
    where,
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true }, // sin 'image'
      },
      curriculumNode: { select: { id: true, name: true, nodeType: true } },
    },
  });

  if (!content)
    return NextResponse.json(
      { error: 'Contenido no encontrado' },
      { status: 404 }
    );

  return NextResponse.json(content, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

/* ------------------------------------------------------------------ */
/*  PUT /api/contenidos/[id]                                          */
/* ------------------------------------------------------------------ */
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const session = await getServerSession(authOptions);
  assertAuth(session);

  const existing = await prisma.contentResource.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: 'Contenido no encontrado' }, { status: 404 });

  const isOwner = existing.createdById === session.user.id;
  const isAdmin = [UserRole.SCHOOL_ADMIN, UserRole.DGE_ADMIN].includes(
    session.user.role as UserRole
  );
  if (!isOwner && !isAdmin)
    return NextResponse.json(
      { error: 'No tienes permisos para editar este contenido' },
      { status: 403 }
    );

  const body = await req.json();
  const parse = ContentSchema.safeParse(body);
  if (!parse.success)
    return NextResponse.json(
      { error: 'Datos inválidos', details: parse.error.flatten() },
      { status: 400 }
    );

  const updated = await prisma.contentResource.update({
    where: { id },
    data: { ...parse.data, updatedAt: new Date() },
  });

  return NextResponse.json(updated);
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/contenidos/[id]                                       */
/* ------------------------------------------------------------------ */
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const session = await getServerSession(authOptions);
  assertAuth(session);

  const existing = await prisma.contentResource.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: 'Contenido no encontrado' }, { status: 404 });

  const isOwner = existing.createdById === session.user.id;
  const isAdmin = [UserRole.SCHOOL_ADMIN, UserRole.DGE_ADMIN].includes(
    session.user.role as UserRole
  );
  if (!isOwner && !isAdmin)
    return NextResponse.json(
      { error: 'No tienes permisos para eliminar este contenido' },
      { status: 403 }
    );

  const asignaciones = await prisma.assignment.count({
    where: { contentResourceId: id },
  });
  if (asignaciones > 0)
    return NextResponse.json(
      {
        error:
          'No se puede eliminar: el contenido está asignado a una o más clases',
      },
      { status: 400 }
    );

  // borrado en cascada (transacción)
  await prisma.$transaction([
    prisma.question.deleteMany({
      where: { evaluation: { contentResourceId: id } },
    }),
    prisma.evaluation.deleteMany({ where: { contentResourceId: id } }),
    prisma.comment.deleteMany({ where: { contentResourceId: id } }),
    prisma.sequencePosition.deleteMany({ where: { contentResourceId: id } }),
    prisma.contentProgress.deleteMany({ where: { contentResourceId: id } }),
    prisma.contentRecommendation.deleteMany({
      where: { contentResourceId: id },
    }),
    prisma.contentResource.delete({ where: { id } }),
  ]);

  return NextResponse.json({ success: true });
}
