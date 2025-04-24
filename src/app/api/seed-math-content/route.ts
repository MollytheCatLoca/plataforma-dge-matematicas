// src/app/api/seed-math-content/route.ts - versión actualizada
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ContentStatus, ContentType, GradeLevel, NodeType } from '@prisma/client';

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
   // Si force=true, limpia datos previos
   if (force) {
     // Eliminar en orden para respetar restricciones de clave foránea
     await prisma.contentProgress.deleteMany({});
     await prisma.sequencePosition.deleteMany({});
     await prisma.learningSequence.deleteMany({});
     await prisma.evaluation.deleteMany({});
     await prisma.question.deleteMany({});
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

   // 1. Primero, buscar o crear nodos curriculares correspondientes
   
   // Año escolar (Primer año)
   const primerAnio = await prisma.curriculumNode.upsert({
     where: { id: 'primer-anio' },
     update: {},
     create: {
       id: 'primer-anio',
       name: 'Primer año',
       description: 'Contenidos de matemáticas para primer año de secundaria',
       nodeType: NodeType.YEAR,
       gradeLevel: [GradeLevel.FIRST],
       learningObjectives: ['Desarrollar competencias matemáticas fundamentales'],
       competencies: ['Pensamiento matemático', 'Resolución de problemas']
     }
   });

   // Ejes temáticos
   const ejeNumeros = await prisma.curriculumNode.upsert({
     where: { id: 'eje-numeros' },
     update: {},
     create: {
       id: 'eje-numeros',
       name: 'Números y operaciones',
       description: 'Sistema de numeración, operaciones y propiedades',
       nodeType: NodeType.AXIS,
       parentId: primerAnio.id,
       order: 1,
       gradeLevel: [GradeLevel.FIRST]
     }
   });

   const ejeAlgebra = await prisma.curriculumNode.upsert({
     where: { id: 'eje-algebra' },
     update: {},
     create: {
       id: 'eje-algebra',
       name: 'Introducción al álgebra',
       description: 'Lenguaje algebraico y ecuaciones',
       nodeType: NodeType.AXIS,
       parentId: primerAnio.id,
       order: 2,
       gradeLevel: [GradeLevel.FIRST]
     }
   });

   const ejeAnalisis = await prisma.curriculumNode.upsert({
     where: { id: 'eje-analisis' },
     update: {},
     create: {
       id: 'eje-analisis',
       name: 'Análisis matemático',
       description: 'Funciones, límites y derivadas',
       nodeType: NodeType.AXIS,
       parentId: primerAnio.id,
       order: 3,
       gradeLevel: [GradeLevel.FIRST]
     }
   });

   // Unidades para cada eje
   const unidadFracciones = await prisma.curriculumNode.upsert({
     where: { id: 'unidad-fracciones' },
     update: {},
     create: {
       id: 'unidad-fracciones',
       name: 'Fracciones',
       description: 'Operaciones con fracciones',
       nodeType: NodeType.UNIT,
       parentId: ejeNumeros.id,
       order: 1,
       gradeLevel: [GradeLevel.FIRST]
     }
   });

   const unidadEcuaciones = await prisma.curriculumNode.upsert({
     where: { id: 'unidad-ecuaciones' },
     update: {},
     create: {
       id: 'unidad-ecuaciones',
       name: 'Ecuaciones',
       description: 'Ecuaciones de primer y segundo grado',
       nodeType: NodeType.UNIT,
       parentId: ejeAlgebra.id,
       order: 1,
       gradeLevel: [GradeLevel.FIRST]
     }
   });

   const unidadLimites = await prisma.curriculumNode.upsert({
     where: { id: 'unidad-limites' },
     update: {},
     create: {
       id: 'unidad-limites',
       name: 'Límites y continuidad',
       description: 'Concepto de límite y funciones continuas',
       nodeType: NodeType.UNIT,
       parentId: ejeAnalisis.id,
       order: 1,
       gradeLevel: [GradeLevel.FIRST]
     }
   });

   // 2. Ahora crear los contenidos asociados a estas unidades
   const mathContents = [
     {
       title: "Fracciones y Operaciones Básicas",
       description: "Las fracciones representan partes de un todo. Una fracción $\\frac{a}{b}$ consta de un numerador $a$ y un denominador $b$. Para sumar fracciones con el mismo denominador: $\\frac{a}{c} + \\frac{b}{c} = \\frac{a+b}{c}$.",
       summary: "Conceptos básicos y operaciones con fracciones.",
       type: ContentType.TEXT_CONTENT,
       status: ContentStatus.PUBLISHED,
       imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
       tags: ["fracciones", "aritmética", "básico"],
       metadata: { 
         difficulty: "EASY", 
         interactivityLevel: "MEDIUM",
         color: "#F7B801" 
       },
       gradeLevels: [GradeLevel.FIRST],
       authorName: "Equipo DGE Matemáticas",
       order: 1,
       visibility: "public",
       curriculumNodeId: unidadFracciones.id
     },
     {
       title: "Ecuaciones Cuadráticas",
       description: "La ecuación cuadrática general tiene la forma $ax^2 + bx + c = 0$. Su solución viene dada por la fórmula: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$.",
       summary: "Resolución y propiedades de ecuaciones cuadráticas.",
       type: ContentType.TEXT_CONTENT,
       status: ContentStatus.PUBLISHED,
       imageUrl: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
       tags: ["álgebra", "ecuaciones", "cuadrática"],
       metadata: { 
         difficulty: "MEDIUM", 
         interactivityLevel: "HIGH",
         color: "#00A8E8" 
       },
       gradeLevels: [GradeLevel.FIRST],
       authorName: "Equipo DGE Matemáticas",
       order: 2,
       visibility: "public",
       curriculumNodeId: unidadEcuaciones.id
     },
     {
       title: "Límites y Continuidad",
       description: "El límite de una función $f(x)$ cuando $x$ tiende a $a$ se denota como $\\lim_{x \\to a} f(x)$. Una función es continua en $x = a$ si $\\lim_{x \\to a} f(x) = f(a)$.",
       summary: "Introducción a límites y continuidad en análisis.",
       type: ContentType.TEXT_CONTENT,
       status: ContentStatus.PUBLISHED,
       imageUrl: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80",
       tags: ["análisis", "límites", "continuidad"],
       metadata: { 
         difficulty: "HARD", 
         interactivityLevel: "HIGH",
         color: "#43AA8B" 
       },
       gradeLevels: [GradeLevel.FIRST],
       authorName: "Equipo DGE Matemáticas",
       order: 3,
       visibility: "public",
       curriculumNodeId: unidadLimites.id
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

   // 3. Crear quizzes (evaluaciones) para cada contenido
   const evaluations = await Promise.all(
     createdContents.map(content => 
       prisma.evaluation.create({
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
       })
     )
   );

   // 4. Crear una secuencia de aprendizaje para fracciones
   const secuenciaMatematicasBasicas = await prisma.learningSequence.create({
     data: {
       name: 'Matemáticas Básicas - Primer Año',
       description: 'Secuencia de aprendizaje para conceptos básicos de primer año',
       curriculumNodeId: primerAnio.id,
       createdById: adminUser.id,
       isTemplate: true
     }
   });

   // 5. Añadir los contenidos a la secuencia
   const secuenciaPositions = await Promise.all(
     createdContents.map((content, index) => 
       prisma.sequencePosition.create({
         data: {
           contentResourceId: content.id,
           sequenceId: secuenciaMatematicasBasicas.id,
           position: index + 1,
           isOptional: false
         }
       })
     )
   );

   // 6. Crear progreso para un estudiante (si existe)
   const estudiante = await prisma.user.findFirst({
     where: { role: 'STUDENT' }
   });

   if (estudiante) {
     // Crear o actualizar progreso del usuario
     const userProgress = await prisma.userProgress.upsert({
       where: { userId: estudiante.id },
       update: {},
       create: {
         userId: estudiante.id,
         lastActivityAt: new Date(),
         totalTimeSpentMinutes: 45,
         completedNodeCount: 1,
         masteryLevel: 25.0
       }
     });

     // Crear progreso para el primer contenido
     const contentProgress = await prisma.contentProgress.create({
       data: {
         userProgressId: userProgress.id,
         contentResourceId: createdContents[0].id,
         status: 'IN_PROGRESS',
         firstAccessAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
         lastAccessAt: new Date(),
         timeSpentMinutes: 25,
         score: 0,
         attemptsCount: 0
       }
     });
   }

   return NextResponse.json({ 
     message: "Contenidos matemáticos y rutas de aprendizaje creados con éxito", 
     data: {
       contenidos: createdContents,
       evaluaciones: evaluations,
       secuencia: secuenciaMatematicasBasicas,
       posiciones: secuenciaPositions
     }
   }, { status: 201 });
 } catch (error) {
   console.error("Error al crear contenidos matemáticos:", error);
   return NextResponse.json({ 
     error: "Error al crear contenidos matemáticos", 
     details: (error instanceof Error ? error.message : String(error)) 
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