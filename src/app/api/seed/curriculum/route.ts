// src/app/api/seed/curriculum/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, NodeType, GradeLevel, PrerequisiteStrength } from '@prisma/client';

// Solo permitir en entorno de desarrollo
const isDevelopment = process.env.NODE_ENV === 'development';
const prisma = new PrismaClient();

export async function GET() {
  if (!isDevelopment) {
    return NextResponse.json({ error: 'Esta ruta solo está disponible en desarrollo' }, { status: 403 });
  }

  try {
    // Buscar admin DGE para asignar como creador del contenido
    const admin = await prisma.user.findFirst({
      where: { role: 'DGE_ADMIN' }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Primero debe ejecutar el seed de usuarios' }, { status: 400 });
    }

    // 1. Crear estructura curricular jerárquica
    // Primer año (nodo raíz)
    const primerAnio = await prisma.curriculumNode.upsert({
      where: { id: 'primer-anio' },
      update: {},
      create: {
        id: 'primer-anio',
        name: 'Primer año',
        description: 'Contenidos de matemáticas para primer año de secundaria',
        nodeType: NodeType.YEAR,
        gradeLevel: [GradeLevel.FIRST],
        learningObjectives: [
          'Comprender operaciones con números enteros',
          'Resolver problemas geométricos básicos',
          'Aplicar proporcionalidad en situaciones cotidianas'
        ],
        estimatedTimeHours: 120,
        isRequired: true,
        competencies: ['Pensamiento matemático', 'Resolución de problemas'],
        metadata: {
          icon: 'number',
          color: '#3498db'
        }
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
        gradeLevel: [GradeLevel.FIRST],
        learningObjectives: ['Operar con números enteros', 'Comprender divisibilidad'],
        estimatedTimeHours: 45,
        isRequired: true
      }
    });

    const ejeGeometria = await prisma.curriculumNode.upsert({
      where: { id: 'eje-geometria' },
      update: {},
      create: {
        id: 'eje-geometria',
        name: 'Geometría y medida',
        description: 'Figuras geométricas, medición y propiedades',
        nodeType: NodeType.AXIS,
        parentId: primerAnio.id,
        order: 2,
        gradeLevel: [GradeLevel.FIRST],
        learningObjectives: ['Clasificar figuras geométricas', 'Calcular perímetros y áreas'],
        estimatedTimeHours: 40,
        isRequired: true
      }
    });

    const ejeAlgebra = await prisma.curriculumNode.upsert({
      where: { id: 'eje-algebra' },
      update: {},
      create: {
        id: 'eje-algebra',
        name: 'Introducción al álgebra',
        description: 'Lenguaje algebraico y ecuaciones simples',
        nodeType: NodeType.AXIS,
        parentId: primerAnio.id,
        order: 3,
        gradeLevel: [GradeLevel.FIRST],
        learningObjectives: ['Interpretar lenguaje algebraico', 'Resolver ecuaciones simples'],
        estimatedTimeHours: 35,
        isRequired: true
      }
    });

    // Unidades para el eje Números
    const unidadFracciones = await prisma.curriculumNode.upsert({
      where: { id: 'unidad-fracciones' },
      update: {},
      create: {
        id: 'unidad-fracciones',
        name: 'Fracciones',
        description: 'Concepto, representación y operaciones con fracciones',
        nodeType: NodeType.UNIT,
        parentId: ejeNumeros.id,
        order: 1,
        gradeLevel: [GradeLevel.FIRST],
        learningObjectives: ['Representar fracciones', 'Operar con fracciones'],
        estimatedTimeHours: 15,
        isRequired: true
      }
    });

    const unidadEnteros = await prisma.curriculumNode.upsert({
      where: { id: 'unidad-enteros' },
      update: {},
      create: {
        id: 'unidad-enteros',
        name: 'Números enteros',
        description: 'Conjunto de números enteros y operaciones',
        nodeType: NodeType.UNIT,
        parentId: ejeNumeros.id,
        order: 2,
        gradeLevel: [GradeLevel.FIRST],
        learningObjectives: ['Comprender el conjunto Z', 'Operar con números negativos'],
        estimatedTimeHours: 15,
        isRequired: true
      }
    });

    // Temas para la unidad Fracciones
    const temaConceptoFraccion = await prisma.curriculumNode.upsert({
      where: { id: 'tema-concepto-fraccion' },
      update: {},
      create: {
        id: 'tema-concepto-fraccion',
        name: 'Concepto de fracción',
        description: 'Definición, interpretación y representación de fracciones',
        nodeType: NodeType.TOPIC,
        parentId: unidadFracciones.id,
        order: 1,
        gradeLevel: [GradeLevel.FIRST],
        learningObjectives: ['Interpretar fracciones como parte de un todo'],
        estimatedTimeHours: 5,
        isRequired: true
      }
    });

    const temaOperacionesFracciones = await prisma.curriculumNode.upsert({
      where: { id: 'tema-operaciones-fracciones' },
      update: {},
      create: {
        id: 'tema-operaciones-fracciones',
        name: 'Operaciones con fracciones',
        description: 'Suma, resta, multiplicación y división de fracciones',
        nodeType: NodeType.TOPIC,
        parentId: unidadFracciones.id,
        order: 2,
        gradeLevel: [GradeLevel.FIRST],
        learningObjectives: ['Realizar operaciones básicas con fracciones'],
        estimatedTimeHours: 10,
        isRequired: true
      }
    });

    // 2. Establecer prerrequisitos entre nodos
    // El concepto de fracción es prerrequisito para operaciones con fracciones
    const prerequisito1 = await prisma.curriculumNodePrerequisite.upsert({
      where: {
        prerequisiteId_nodeId: {
          prerequisiteId: temaConceptoFraccion.id,
          nodeId: temaOperacionesFracciones.id
        }
      },
      update: {},
      create: {
        prerequisiteId: temaConceptoFraccion.id,
        nodeId: temaOperacionesFracciones.id,
        strengthLevel: PrerequisiteStrength.REQUIRED
      }
    });

    // 3. Crear contenidos asociados a los nodos
    const contenidoFracciones = await prisma.contentResource.create({
      data: {
        title: 'Fracciones y sus representaciones',
        description: 'Las fracciones representan partes de un todo. Una fracción $\\frac{a}{b}$ consta de un numerador $a$ y un denominador $b$.',
        summary: 'Introducción al concepto de fracciones y sus representaciones visuales',
        type: 'TEXT_CONTENT',
        status: 'PUBLISHED',
        gradeLevels: [GradeLevel.FIRST],
        tags: ['fracciones', 'conceptos básicos', 'representación'],
        metadata: {
          difficulty: 'EASY',
          interactivityLevel: 'MEDIUM'
        },
        createdById: admin.id,
        curriculumNodeId: temaConceptoFraccion.id,
        imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
        duration: 15
      }
    });

    const contenidoOperaciones = await prisma.contentResource.create({
      data: {
        title: 'Operaciones con fracciones',
        description: 'Aprende a sumar, restar, multiplicar y dividir fracciones con estos métodos: $\\frac{a}{c} + \\frac{b}{c} = \\frac{a+b}{c}$',
        summary: 'Guía completa para realizar operaciones con fracciones',
        type: 'TEXT_CONTENT',
        status: 'PUBLISHED',
        gradeLevels: [GradeLevel.FIRST],
        tags: ['fracciones', 'suma', 'resta', 'multiplicación', 'división'],
        metadata: {
          difficulty: 'MEDIUM',
          interactivityLevel: 'HIGH'
        },
        createdById: admin.id,
        curriculumNodeId: temaOperacionesFracciones.id,
        imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
        duration: 25
      }
    });

    // 4. Crear una secuencia de aprendizaje
    const secuenciaFracciones = await prisma.learningSequence.create({
      data: {
        name: 'Aprendiendo sobre fracciones',
        description: 'Secuencia para comprender fracciones desde lo básico hasta operaciones avanzadas',
        curriculumNodeId: unidadFracciones.id,
        createdById: admin.id,
        isTemplate: true
      }
    });

    // 5. Posiciones de contenido en la secuencia
    const pos1 = await prisma.sequencePosition.create({
      data: {
        contentResourceId: contenidoFracciones.id,
        sequenceId: secuenciaFracciones.id,
        position: 1,
        isOptional: false
      }
    });

    const pos2 = await prisma.sequencePosition.create({
      data: {
        contentResourceId: contenidoOperaciones.id,
        sequenceId: secuenciaFracciones.id,
        position: 2,
        isOptional: false
      }
    });

    // 6. Crear registros de progreso para un estudiante
    // Buscar un estudiante
    const estudiante = await prisma.user.findFirst({
      where: { role: 'STUDENT' }
    });

    if (estudiante) {
      // Crear progreso del usuario
      const userProgress = await prisma.userProgress.create({
        data: {
          userId: estudiante.id,
          lastActivityAt: new Date(),
          totalTimeSpentMinutes: 45,
          completedNodeCount: 1,
          masteryLevel: 25.0
        }
      });

      // Progreso en la ruta de aprendizaje
      const pathProgress = await prisma.learningPathProgress.create({
        data: {
          userProgressId: userProgress.id,
          curriculumNodeId: unidadFracciones.id,
          startedAt: new Date(),
          percentComplete: 40.0,
          averageScore: 85.0,
          strengths: ['Identificación de fracciones'],
          weaknesses: ['Fracciones equivalentes']
        }
      });

      // Progreso en contenido específico
      const contentProgress1 = await prisma.contentProgress.create({
        data: {
          userProgressId: userProgress.id,
          contentResourceId: contenidoFracciones.id,
          status: 'COMPLETED',
          firstAccessAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
          lastAccessAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
          timeSpentMinutes: 25,
          score: 90.0,
          attemptsCount: 1,
          interactionData: {
            sectionsRead: ["introducción", "representación", "ejemplos"],
            quizCompleted: true
          }
        }
      });

      const contentProgress2 = await prisma.contentProgress.create({
        data: {
          userProgressId: userProgress.id,
          contentResourceId: contenidoOperaciones.id,
          status: 'IN_PROGRESS',
          firstAccessAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
          lastAccessAt: new Date(),
          timeSpentMinutes: 20,
          attemptsCount: 0,
          interactionData: {
            sectionsRead: ["introducción", "suma de fracciones"],
            quizCompleted: false
          }
        }
      });

      // Crear analíticas de aprendizaje
      const analytics = await prisma.userLearningAnalytics.create({
        data: {
          userId: estudiante.id,
          learningStyle: {
            visual: 0.7,
            auditory: 0.3,
            kinesthetic: 0.5
          },
          peakActivityTimes: {
            "weekday": "tarde",
            "weekend": "mañana"
          },
          strengths: ["representación visual", "fracciones simples"],
          weaknesses: ["operaciones combinadas", "fracciones mixtas"],
          riskLevel: "LOW",
          predictedAreas: {
            potentialStruggle: "división de fracciones",
            recommendedFocus: "práctica adicional en operaciones"
          }
        }
      });

      // Crear una recomendación de contenido
      const recommendation = await prisma.contentRecommendation.create({
        data: {
          analyticsId: analytics.id,
          contentResourceId: contenidoOperaciones.id,
          reason: "Reforzamiento de operaciones con fracciones",
          priority: 8,
          status: "ACTIVE"
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        curriculumTree: {
          year: primerAnio,
          axes: [ejeNumeros, ejeGeometria, ejeAlgebra],
          units: [unidadFracciones, unidadEnteros],
          topics: [temaConceptoFraccion, temaOperacionesFracciones]
        },
        prerequisites: [prerequisito1],
        contents: [contenidoFracciones, contenidoOperaciones],
        sequence: secuenciaFracciones
      }
    });

  } catch (error) {
    console.error('Error sembrando datos curriculares:', error);
    return NextResponse.json({
      error: `Error al crear estructura curricular: ${error instanceof Error ? error.message : 'Desconocido'}`
    }, { status: 500 });
  }
}