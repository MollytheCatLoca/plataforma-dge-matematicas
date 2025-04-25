import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Define the expected structure of the context object passed by Next.js
interface RouteContext {
  params: {
    contentId: string;
  };
}

// GET /api/content/[contentId]/comments - Fetch comments for a specific content
export async function GET(request: NextRequest, context: RouteContext) {
  // Access contentId from the context object's params property
  const { contentId } = context.params;

  try {
    // Optional: Check session if needed
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    // }

    const comments = await prisma.comment.findMany({
      where: {
        contentResourceId: contentId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true, // Include author image if available
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Show newest comments first
      },
    });

    return NextResponse.json(comments);

  } catch (error) {
    console.error(`Error fetching comments for content ${contentId}:`, error);
    return NextResponse.json(
      {
        error: 'Error al obtener comentarios',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
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