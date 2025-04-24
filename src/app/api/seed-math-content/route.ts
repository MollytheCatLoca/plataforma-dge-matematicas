// src/app/api/seed-math-content/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ContentStatus, ContentType } from '@prisma/client';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const force = url.searchParams.get('force') === 'true';
  return handleSeedRequest(force);
}

export async function POST(request: Request) {
  const url = new URL(request.url, 'http://localhost');
  const force = url.searchParams.get('force') === 'true';
  return handleSeedRequest(force);
}

async function handleSeedRequest(force = false) {
  try {
    // Si force=true, borra quizzes y contenidos previos
    if (force) {
      await prisma.evaluation.deleteMany({});
      await prisma.contentResource.deleteMany({
        where: {
          title: {
            in: [
              "Fracciones y Operaciones Básicas",
              "Ecuaciones Cuadráticas",
              "Límites y Continuidad"
            ]
          }
        }
      });
    }

    // Verificar si ya existen ejemplos de contenido matemático
    const existingMathContent = await prisma.contentResource.findFirst({
      where: {
        title: {
          contains: "Fracciones y Operaciones Básicas"
        }
      }
    });

    if (existingMathContent && !force) {
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
        description: "Las fracciones representan partes de un todo. Una fracción $\\frac{a}{b}$ consta de un numerador $a$ y un denominador $b$. Para sumar fracciones con el mismo denominador: $\\frac{a}{c} + \\frac{b}{c} = \\frac{a+b}{c}$.",
        summary: "Conceptos básicos y operaciones con fracciones.",
        type: ContentType.TEXT_CONTENT,
        status: ContentStatus.PUBLISHED,
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
        tags: ["fracciones", "aritmética", "básico"],
        metadata: { difficulty: "fácil", color: "#F7B801" },
        authorName: "Equipo DGE Matemáticas",
        order: 1,
        visibility: "public"
      },
      {
        title: "Ecuaciones Cuadráticas",
        description: "La ecuación cuadrática general tiene la forma $ax^2 + bx + c = 0$. Su solución viene dada por la fórmula: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$.",
        summary: "Resolución y propiedades de ecuaciones cuadráticas.",
        type: ContentType.TEXT_CONTENT,
        status: ContentStatus.PUBLISHED,
        imageUrl: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
        tags: ["álgebra", "ecuaciones", "cuadrática"],
        metadata: { difficulty: "intermedio", color: "#00A8E8" },
        authorName: "Equipo DGE Matemáticas",
        order: 2,
        visibility: "public"
      },
      {
        title: "Límites y Continuidad",
        description: "El límite de una función $f(x)$ cuando $x$ tiende a $a$ se denota como $\\lim_{x \\to a} f(x)$. Una función es continua en $x = a$ si $\\lim_{x \\to a} f(x) = f(a)$.",
        summary: "Introducción a límites y continuidad en análisis.",
        type: ContentType.TEXT_CONTENT,
        status: ContentStatus.PUBLISHED,
        imageUrl: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80",
        tags: ["análisis", "límites", "continuidad"],
        metadata: { difficulty: "avanzado", color: "#43AA8B" },
        authorName: "Equipo DGE Matemáticas",
        order: 3,
        visibility: "public"
      }
    ];

    // Insertar los contenidos en la base de datos
    const createdContents = await Promise.all(
      mathContents.map(({ summary, ...content }) => 
        prisma.contentResource.create({
          data: {
            ...content,
            createdById: adminUser.id
          }
        })
      )
    );

    // Crear quizzes (evaluaciones) para cada contenido
    for (const content of createdContents) {
      const evaluation = await prisma.evaluation.create({
        data: {
          contentResourceId: content.id,
          timeLimitMinutes: 10,
          maxAttempts: 3,
          shuffleQuestions: true,
          showResult: true,
          questions: {
            create: getQuizQuestionsForContent(content.title)
          }
        }
      });
    }

    return NextResponse.json({ 
      message: "Contenidos matemáticos y quizzes creados con éxito", 
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

// --- Helpers para quizzes divertidos ---
function getQuizQuestionsForContent(title: string) {
  if (title.includes("Fracciones")) {
    return [
      {
        text: "¿Cuál es el resultado de $\\frac{1}{2} + \\frac{1}{4}$?",
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify([
          { id: "a", text: "$\\frac{2}{6}$" },
          { id: "b", text: "$\\frac{3}{4}$" },
          { id: "c", text: "$\\frac{1}{6}$" },
          { id: "d", text: "$1$" }
        ]),
        correctAnswer: JSON.stringify("b"),
        points: 1,
        order: 1
      },
      {
        text: "¿Verdadero o falso? $\\frac{2}{4}$ es igual a $\\frac{1}{2}$.",
        type: "TRUE_FALSE",
        correctAnswer: JSON.stringify(true),
        points: 1,
        order: 2
      }
    ];
  }
  if (title.includes("Cuadráticas")) {
    return [
      {
        text: "¿Cuántas soluciones reales puede tener una ecuación cuadrática?",
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify([
          { id: "a", text: "Siempre dos" },
          { id: "b", text: "Cero, una o dos" },
          { id: "c", text: "Solo una" },
          { id: "d", text: "Infinitas" }
        ]),
        correctAnswer: JSON.stringify("b"),
        points: 1,
        order: 1
      },
      {
        text: "¿Verdadero o falso? La fórmula cuadrática resuelve cualquier ecuación de segundo grado.",
        type: "TRUE_FALSE",
        correctAnswer: JSON.stringify(true),
        points: 1,
        order: 2
      }
    ];
  }
  if (title.includes("Límites")) {
    return [
      {
        text: "¿Qué significa $\\lim_{x \\to a} f(x) = L$?",
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify([
          { id: "a", text: "Cuando $x$ se acerca a $a$, $f(x)$ se acerca a $L$" },
          { id: "b", text: "$f(a) = L$ siempre" },
          { id: "c", text: "No tiene sentido" },
          { id: "d", text: "$x$ nunca puede ser $a$" }
        ]),
        correctAnswer: JSON.stringify("a"),
        points: 1,
        order: 1
      },
      {
        text: "¿Verdadero o falso? Si una función es continua en $x=a$, entonces el límite existe en ese punto.",
        type: "TRUE_FALSE",
        correctAnswer: JSON.stringify(true),
        points: 1,
        order: 2
      }
    ];
  }
  // Default: pregunta divertida
  return [
    {
      text: "¿Te gusta aprender matemáticas?",
      type: "MULTIPLE_CHOICE",
      options: JSON.stringify([
        { id: "a", text: "¡Sí!" },
        { id: "b", text: "A veces" },
        { id: "c", text: "Prefiero otra materia" }
      ]),
      correctAnswer: JSON.stringify("a"),
      points: 1,
      order: 1
    }
  ];
}