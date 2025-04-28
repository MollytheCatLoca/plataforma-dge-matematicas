// src/app/api/contenidos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  console.log(`[API_DEBUG] Iniciando solicitud GET para contenido`);
  
  try {
    // Resolver parámetros
    const resolvedParams = await Promise.resolve(params);
    const contentId = resolvedParams.id;
    console.log(`[API_DEBUG] ID de contenido solicitado: ${contentId}`);
    
    // Verificar cookies y headers
    console.log(`[API_DEBUG] Cookies: ${request.headers.get('cookie')}`);
    console.log(`[API_DEBUG] Referrer: ${request.headers.get('referer')}`);
    
    // Intentar obtener sesión
    console.log(`[API_DEBUG] Obteniendo sesión...`);
    const session = await getServerSession(authOptions);
    console.log(`[API_DEBUG] Sesión obtenida:`, session ? 'Sí' : 'No');
    
    if (session) {
      console.log(`[API_DEBUG] Usuario autenticado: ${session.user?.email}, Rol: ${session.user?.role}`);
    } else {
      console.log(`[API_DEBUG] No hay sesión activa`);
    }
    
    // Consultar base de datos
    console.log(`[API_DEBUG] Consultando base de datos...`);
    const content = await prisma.contentResource.findUnique({
      where: { id: contentId },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true }
        },
        curriculumNode: { 
          select: { id: true, name: true, nodeType: true } 
        },
        evaluation: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });
    
    console.log(`[API_DEBUG] Resultado de la consulta:`, content ? 'Contenido encontrado' : 'Contenido no encontrado');
    
    if (!content) {
      console.log(`[API_DEBUG] Enviando respuesta 404`);
      return NextResponse.json(
        { error: 'Contenido no encontrado', id: contentId },
        { status: 404 }
      );
    }
    
    // Preparar respuesta
    console.log(`[API_DEBUG] Preparando respuesta con contenido ID: ${content.id}, Título: ${content.title}`);
    
    return NextResponse.json(content, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    console.error(`[API_DEBUG] Error en API:`, error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}