// src/app/api/seed/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Solo permitir en entorno de desarrollo
const isDevelopment = process.env.NODE_ENV === 'development';
const prisma = new PrismaClient();

export async function GET() {
  if (!isDevelopment) {
    return NextResponse.json({ error: 'Esta ruta solo está disponible en desarrollo' }, { status: 403 });
  }

  try {
    const saltRounds = 10;
    
    // Crear escuela de ejemplo
    const school = await prisma.school.upsert({
      where: { cue: '123456' }, // Usar CUE que es un campo único según tu schema
      update: {},
      create: {
        name: 'Escuela Piloto DGE',
        cue: '123456',
        address: 'Av. Ejemplo 123, Mendoza'
      }
    });

    // Crear administrador de DGE
    const adminHash = await bcrypt.hash('admin123', saltRounds);
    const dgeAdmin = await prisma.user.upsert({
      where: { email: 'admin@dge.edu.ar' },
      update: {},
      create: {
        email: 'admin@dge.edu.ar',
        hashedPassword: adminHash,
        firstName: 'Admin',
        lastName: 'DGE',
        role: UserRole.DGE_ADMIN,
        isActive: true,
      },
    });
    
    // Crear administrador de escuela
    const schoolAdminHash = await bcrypt.hash('schooladmin123', saltRounds);
    const schoolAdmin = await prisma.user.upsert({
      where: { email: 'director@escuela.edu.ar' },
      update: {},
      create: {
        email: 'director@escuela.edu.ar',
        hashedPassword: schoolAdminHash,
        firstName: 'Director',
        lastName: 'Escuela',
        role: UserRole.SCHOOL_ADMIN,
        isActive: true,
        schoolId: school.id
      },
    });
    
    // Crear profesor
    const teacherHash = await bcrypt.hash('teacher123', saltRounds);
    const teacher = await prisma.user.upsert({
      where: { email: 'teacher@escuela.edu.ar' },
      update: {},
      create: {
        email: 'teacher@escuela.edu.ar',
        hashedPassword: teacherHash,
        firstName: 'Profesor',
        lastName: 'Ejemplo',
        role: UserRole.TEACHER,
        isActive: true,
        schoolId: school.id
      },
    });
    
    // Crear estudiante
    const studentHash = await bcrypt.hash('student123', saltRounds);
    const student = await prisma.user.upsert({
      where: { email: 'student@escuela.edu.ar' },
      update: {},
      create: {
        email: 'student@escuela.edu.ar',
        hashedPassword: studentHash,
        firstName: 'Estudiante',
        lastName: 'Ejemplo',
        role: UserRole.STUDENT,
        isActive: true,
        schoolId: school.id
      },
    });

    // Crear una clase (usando los IDs generados)
    const clase = await prisma.class.create({
      data: {
        name: 'Matemáticas 1A',
        description: 'Primer año, sección A',
        academicYear: 2025,
        schoolId: school.id,
        teacherId: teacher.id
      }
    });

    // Añadir estudiante a la clase
    const enrollment = await prisma.classEnrollment.create({
      data: {
        classId: clase.id,
        studentId: student.id
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        school,
        dgeAdmin,
        schoolAdmin,
        teacher,
        student,
        clase,
        enrollment
      }
    });
  } catch (error) {
    console.error('Error sembrando datos:', error);
    return NextResponse.json({ error: `Error al crear usuarios: ${error instanceof Error ? error.message : 'Desconocido'}` }, { status: 500 });
  }
}