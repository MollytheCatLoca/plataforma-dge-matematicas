// src/app/api/seed-math-content/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ContentStatus, ContentType } from '@prisma/client';

export async function GET() {
  return handleSeedRequest();
}

export async function POST() {
  return handleSeedRequest();
}

async function handleSeedRequest() {
  try {
    // Verificar si ya existen ejemplos de contenido matemático
    const existingMathContent = await prisma.contentResource.findFirst({
      where: {
        title: {
          contains: "Fracciones y Operaciones Básicas"
        }
      }
    });

    if (existingMathContent) {
      return NextResponse.json({ 
        message: "Los datos de ejemplo ya existen en la base de datos",
        data: [existingMathContent]
      });
    }

    // Buscar un usuario admin para asociar al contenido
    const adminUser = await prisma.user.findFirst({
      where: {
        role: "DGE_ADMIN"
      }
    });

    if (!adminUser) {
      return NextResponse.json({ 
        error: "No se encontró un usuario administrador para asociar al contenido" 
      }, { status: 400 });
    }

    // Crear algunos recursos con contenido matemático
    const mathContents = [
      {
        title: "Fracciones y Operaciones Básicas",
        description: "Las fracciones representan partes de un todo. Una fracción $\\frac{a}{b}$ consta de un numerador $a$ y un denominador $b$. Para sumar fracciones con el mismo denominador: $\\frac{a}{c} + \\frac{b}{c} = \\frac{a+b}{c}$.\n\nPara multiplicar fracciones: $$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$$",
        type: ContentType.TEXT_CONTENT,
        status: ContentStatus.PUBLISHED,
      },
      {
        title: "Ecuaciones Cuadráticas",
        description: "La ecuación cuadrática general tiene la forma $ax^2 + bx + c = 0$. Su solución viene dada por la fórmula: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\nEl discriminante $b^2 - 4ac$ determina el número de soluciones.",
        type: ContentType.TEXT_CONTENT,
        status: ContentStatus.PUBLISHED,
      },
      {
        title: "Límites y Continuidad",
        description: "El límite de una función $f(x)$ cuando $x$ tiende a $a$ se denota como $\\lim_{x \\to a} f(x)$. Una función es continua en $x = a$ si $\\lim_{x \\to a} f(x) = f(a)$.\n\nAlgunos límites importantes: $$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$ $$\\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right)^n = e$$",
        type: ContentType.TEXT_CONTENT,
        status: ContentStatus.PUBLISHED,
      }
    ];

    // Insertar los contenidos en la base de datos
    const createdContents = await Promise.all(
      mathContents.map(content => 
        prisma.contentResource.create({
          data: {
            ...content,
            createdById: adminUser.id
          }
        })
      )
    );

    return NextResponse.json({ 
      message: "Contenidos matemáticos creados con éxito", 
      data: createdContents 
    }, { status: 201 });
  } catch (error) {
    console.error("Error al crear contenidos matemáticos:", error);
    return NextResponse.json({ 
      error: "Error al crear contenidos matemáticos", 
      details: (error as Error).message 
    }, { status: 500 });
  }
}