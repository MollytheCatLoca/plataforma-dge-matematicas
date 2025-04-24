import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/content/[contentId]/comments
export async function GET(
  request: Request,
  { params }: { params: { contentId: string } }
) {
  const { contentId } = params;

  try {
    const comments = await prisma.comment.findMany({
      where: { contentResourceId: contentId },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true }, // Incluir datos básicos del autor
        },
      },
      orderBy: {
        createdAt: 'desc', // Mostrar los más recientes primero
      },
    });
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: 'Error al obtener comentarios' }, { status: 500 });
  }
}

// POST /api/content/[contentId]/comments
export async function POST(
  request: Request,
  { params }: { params: { contentId: string } }
) {
  const { contentId } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { text, rating } = await request.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'El texto del comentario es requerido' }, { status: 400 });
    }

    // Validar rating si se proporciona
    const parsedRating = rating ? parseInt(rating, 10) : null;
    if (parsedRating !== null && (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5)) {
      return NextResponse.json({ error: 'La valoración debe ser un número entre 1 y 5' }, { status: 400 });
    }

    const newComment = await prisma.comment.create({
      data: {
        text: text.trim(),
        rating: parsedRating,
        authorId: userId,
        contentResourceId: contentId,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: 'Error al crear comentario' }, { status: 500 });
  }
}