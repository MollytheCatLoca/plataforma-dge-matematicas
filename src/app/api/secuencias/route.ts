// src/app/api/secuencias/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// Obtener todas las secuencias
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Filtros por query params
    const { searchParams } = new URL(request.url);
    const templateOnly = searchParams.get('template') === 'true';
    const nodeId = searchParams.get('node');

    // Construir consulta
    const query: any = {};
    
    if (templateOnly) {
      query.isTemplate = true;
    }
    
    if (nodeId) {
      query.curriculumNodeId = nodeId;
    }

    const secuencias = await prisma.learningSequence.findMany({
      where: query,
      include: {
        curriculumNode: {
          select: { name: true, nodeType: true }
        },
        createdBy: {
            select: { 
                firstName: true, 
                lastName: true 
              }
            },
            contents: {
              select: {
                id: true,
                position: true
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        });
    
        return NextResponse.json(secuencias);
      } catch (error) {
        console.error('Error al obtener secuencias:', error);
        return NextResponse.json(
          { error: 'Error al obtener secuencias' },
          { status: 500 }
        );
      }
    }
    
    // Crear una nueva secuencia
    export async function POST(request: Request) {
      try {
        const session = await getServerSession(authOptions);
        if (!session) {
          return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }
    
        // Verificar permisos
        if (![UserRole.TEACHER, UserRole.SCHOOL_ADMIN, UserRole.DGE_ADMIN].includes(session.user.role)) {
          return NextResponse.json({ error: 'No tienes permisos para crear secuencias' }, { status: 403 });
        }
    
        const body = await request.json();
    
        // Validar datos mínimos
        if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
          return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        }
    
        // Preparar datos para crear la secuencia
        const data: any = {
          name: body.name.trim(),
          description: body.description?.trim() || null,
          isTemplate: body.isTemplate || false,
          createdById: session.user.id
        };
    
        // Agregar curriculumNodeId si se proporciona
        if (body.curriculumNodeId && body.curriculumNodeId.trim() !== '') {
          // Verificar si el nodo existe
          const nodeExists = await prisma.curriculumNode.findUnique({
            where: { id: body.curriculumNodeId }
          });
    
          if (!nodeExists) {
            return NextResponse.json({ error: 'El nodo curricular especificado no existe' }, { status: 400 });
          }
    
          data.curriculumNodeId = body.curriculumNodeId;
        }
    
        // Crear la secuencia
        const newSequence = await prisma.learningSequence.create({
          data
        });
    
        return NextResponse.json(newSequence, { status: 201 });
      } catch (error) {
        console.error('Error al crear secuencia:', error);
        return NextResponse.json(
          { error: 'Error al crear secuencia' },
          { status: 500 }
        );
      }
    }