// src/app/api/contenidos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { ContentStatus, ContentType, UserRole } from '@prisma/client';

// Validación básica para el objeto de contenido (reutilizable)
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

// GET /api/contenidos/[id] - Obtener un contenido específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API] GET /api/contenidos/[id] - Request for content:', params.id);
  
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[API] Authentication failed for content retrieval');
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (!params.id) {
      console.log('[API] Missing content ID parameter');
      return NextResponse.json({ error: 'ID de contenido requerido' }, { status: 400 });
    }

    // Buscar el contenido
    const content = await prisma.contentResource.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true
          }
        },
        curriculumNode: true,
      }
    });

    // Verificar si existe
    if (!content) {
      console.log(`[API] Content not found: ${params.id}`);
      return NextResponse.json({ error: 'Contenido no encontrado' }, { status: 404 });
    }

    console.log(`[API] Successfully retrieved content: ${params.id}`);
    return NextResponse.json(content);
    
  } catch (error) {
    console.error(`[API] Error fetching content ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error al obtener el contenido', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

// PUT /api/contenidos/[id] - Actualizar un contenido
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    // Obtener el contenido existente
    const existingContent = await prisma.contentResource.findUnique({
      where: { id: params.id }
    });
    
    // Si no existe, devolver 404
    if (!existingContent) {
      return NextResponse.json({ error: 'Contenido no encontrado' }, { status: 404 });
    }
    
    // Verificar permisos: solo el creador o administradores pueden editar
    const isOwner = existingContent.createdById === session.user.id;
    const isAdmin = [UserRole.SCHOOL_ADMIN, UserRole.DGE_ADMIN].includes(session.user.role as UserRole);
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'No tienes permisos para editar este contenido' }, { status: 403 });
    }
    
    // Obtener datos de actualización
    const contentData = await request.json();
    
    // Validar datos
    const validationErrors = validateContentData(contentData);
    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Datos de contenido inválidos', 
        details: validationErrors 
      }, { status: 400 });
    }
    
    // Actualizar el contenido
    const updatedContent = await prisma.contentResource.update({
      where: { id: params.id },
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
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({ 
      error: 'Error al actualizar el contenido',
      details: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}

// DELETE /api/contenidos/[id] - Eliminar un contenido
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    // Obtener el contenido existente
    const existingContent = await prisma.contentResource.findUnique({
      where: { id: params.id }
    });
    
    // Si no existe, devolver 404
    if (!existingContent) {
      return NextResponse.json({ error: 'Contenido no encontrado' }, { status: 404 });
    }
    
    // Verificar permisos: solo el creador o administradores pueden eliminar
    const isOwner = existingContent.createdById === session.user.id;
    const isAdmin = [UserRole.SCHOOL_ADMIN, UserRole.DGE_ADMIN].includes(session.user.role as UserRole);
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'No tienes permisos para eliminar este contenido' }, { status: 403 });
    }
    
    // Verificar dependencias: no se puede eliminar si hay asignaciones activas
    const assignments = await prisma.assignment.count({
      where: {
        contentResourceId: params.id
      }
    });
    
    if (assignments > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar el contenido porque está asignado a una o más clases. Desasígnelo primero.' 
      }, { status: 400 });
    }
    
    // Si tiene evaluaciones asociadas, eliminarlas primero
    const evaluation = await prisma.evaluation.findUnique({
      where: { contentResourceId: params.id },
      include: { questions: true }
    });
    
    if (evaluation) {
      // Eliminar preguntas de la evaluación
      await prisma.question.deleteMany({
        where: { evaluationId: evaluation.id }
      });
      
      // Eliminar evaluación
      await prisma.evaluation.delete({
        where: { id: evaluation.id }
      });
    }
    
    // Eliminar comentarios si existen
    await prisma.comment.deleteMany({
      where: { contentResourceId: params.id }
    });
    
    // Eliminar posiciones en secuencias si existen
    await prisma.sequencePosition.deleteMany({
      where: { contentResourceId: params.id }
    });
    
    // Eliminar el progreso de contenido si existe
    await prisma.contentProgress.deleteMany({
      where: { contentResourceId: params.id }
    });
    
    // Eliminar recomendaciones de contenido si existen
    await prisma.contentRecommendation.deleteMany({
      where: { contentResourceId: params.id }
    });
    
    // Finalmente, eliminar el contenido
    await prisma.contentResource.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json({ 
      error: 'Error al eliminar el contenido',
      details: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}