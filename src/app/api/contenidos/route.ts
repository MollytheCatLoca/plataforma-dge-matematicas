// src/app/api/contenidos/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ContentStatus, ContentType, GradeLevel, UserRole } from '@prisma/client';

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

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  if (![UserRole.TEACHER, UserRole.SCHOOL_ADMIN, UserRole.DGE_ADMIN].includes(session.user.role as UserRole)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await req.json();
  const parse = ContentSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parse.error.flatten() }, { status: 400 });
  }

  try {
    const content = await prisma.contentResource.create({
      data: { ...parse.data, createdById: session.user.id },
    });
    return NextResponse.json(content, { status: 201 });
  } catch (err: any) {
    if (err.code === 'P2002') return NextResponse.json({ error: 'Ya existe' }, { status: 409 });
    return NextResponse.json({ error: 'Error servidor', details: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get('take')) || 20, 100);
  const skip = Number(searchParams.get('skip')) || 0;

  const where: any = {};

  if (searchParams.get('type')) where.type = searchParams.get('type');
  if (searchParams.get('status')) where.status = searchParams.get('status');
  else if (session.user.role === UserRole.STUDENT) where.status = ContentStatus.PUBLISHED;
  if (searchParams.get('gradeLevel')) where.gradeLevels = { has: searchParams.get('gradeLevel') };
  if (searchParams.get('curriculumNodeId')) where.curriculumNodeId = searchParams.get('curriculumNodeId');

  const tags = (searchParams.get('tags') ?? '').split(',').filter(Boolean);
  if (tags.length) where.tags = { hasSome: tags };

  const search = searchParams.get('search');
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
    ];
  }

  const [contents, total] = await Promise.all([
    prisma.contentResource.findMany({
      where,
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
        curriculumNode: { select: { id: true, name: true, nodeType: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.contentResource.count({ where }),
  ]);

  return NextResponse.json({ contents, pagination: { total, skip, take } }, { headers: { 'Cache-Control': 'no-store' } });
}
