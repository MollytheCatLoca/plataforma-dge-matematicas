// src/app/api/contenidos/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { ContentStatus, ContentType, UserRole } from '@prisma/client';

// Validación básica para el objeto de contenido
const validateContentData = (data: any) => {
  const errors: string[] = [];
  
  // Campos obligatorios
  if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
    errors.push('El título es obligatorio');
  }
  
  if (!data.type || !Object.values(ContentType).includes(data.type)) {
    errors.push('El tipo de contenido es inválido o no está especificado');
  }
  
  if (!data.status || !Object.values(ContentStatus).includes(data.status)) {
    errors.push('El estado de contenido es inválido o no está especificado');
  }
  
  // Validaciones específicas por tipo
  if (data.type === ContentType.VIDEO || data.type === ContentType.PDF || data.type === ContentType.EXTERNAL_LINK) {
    if (!data.contentUrl) {
      errors.push(`La URL es obligatoria para contenido tipo ${data.type}`);
    }
  }
  
  if (data.type === ContentType.SIMULATION && !data.contentBody) {
    errors.push('La configuración de la simulación es obligatoria');
  }
  
  return errors;
};

// POST /api/contenidos - Crear nuevo contenido
export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    // Verificar permisos
    if (![UserRole.TEACHER, UserRole.SCHOOL_ADMIN, UserRole.DGE_ADMIN].includes(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'No autorizado para crear contenido' }, { status: 403 });
    }
    
    // Obtener datos del contenido
    const contentData = await request.json();
    
    // Validar datos
    const validationErrors = validateContentData(contentData);
    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Datos de contenido inválidos', 
        details: validationErrors 
      }, { status: 400 });
    }
    
    // Crear el contenido
    const content = await prisma.contentResource.create({
      data: {
        title: contentData.title.trim(),
        description: contentData.description?.trim(),
        summary: contentData.summary?.trim(),
        type: contentData.type,
        status: contentData.status,
        contentUrl: contentData.contentUrl,
        imageUrl: contentData.imageUrl,
        contentBody: contentData.contentBody,
        tags: contentData.tags || [],
        gradeLevels: contentData.gradeLevels || [],
        curriculumNodeId: contentData.curriculumNodeId || null,
        authorName: contentData.authorName?.trim(),
        duration: contentData.duration || null,
        visibility: contentData.visibility || 'public',
        createdById: session.user.id // Asociar al usuario actual
      }
    });
    
    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json({ 
      error: 'Error al crear contenido',
      details: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}

// GET /api/contenidos - Obtener lista de contenidos
export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    // Parsear parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '20');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const gradeLevel = searchParams.get('gradeLevel');
    const curriculumNodeId = searchParams.get('curriculumNodeId');
    const tags = searchParams.get('tags')?.split(',');
    
    // Construir consulta
    const where: any = {};
    
    // Filtro por tipo
    if (type) {
      where.type = type;
    }
    
    // Filtro por estado (los estudiantes solo pueden ver publicados)
    if (status) {
      where.status = status;
    } else if (session.user.role === UserRole.STUDENT) {
      where.status = ContentStatus.PUBLISHED;
    }
    
    // Filtro por nivel/grado
    if (gradeLevel) {
      where.gradeLevels = { has: gradeLevel };
    }
    
    // Filtro por nodo curricular
    if (curriculumNodeId) {
      where.curriculumNodeId = curriculumNodeId;
    }
    
    // Filtro por etiquetas
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }
    
    // Búsqueda por texto
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { array_contains: search } }
      ];
    }
    
    // Ejecutar consulta
    const contents = await prisma.contentResource.findMany({
      where,
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        curriculumNode: {
          select: {
            id: true,
            name: true,
            nodeType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });
    
    // Contar total para paginación
    const total = await prisma.contentResource.count({ where });

    // Para debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Returning ${contents.length} contents out of ${total} total`);
    }

    return NextResponse.json({
      contents,
      pagination: {
        total,
        skip,
        take
      }
    });
  } catch (error) {
    console.error('Error fetching contents:', error);
    return NextResponse.json({ 
      error: 'Error al obtener contenidos',
      details: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}