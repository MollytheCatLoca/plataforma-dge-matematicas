// scripts/seed-users.ts
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsers() {
  const saltRounds = 10;
  
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
  
  // Crear profesor
  const teacherHash = await bcrypt.hash('teacher123', saltRounds);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@dge.edu.ar' },
    update: {},
    create: {
      email: 'teacher@dge.edu.ar',
      hashedPassword: teacherHash,
      firstName: 'Profesor',
      lastName: 'Ejemplo',
      role: UserRole.TEACHER,
      isActive: true,
    },
  });
  
  // Crear estudiante
  const studentHash = await bcrypt.hash('student123', saltRounds);
  const student = await prisma.user.upsert({
    where: { email: 'student@dge.edu.ar' },
    update: {},
    create: {
      email: 'student@dge.edu.ar',
      hashedPassword: studentHash,
      firstName: 'Estudiante',
      lastName: 'Ejemplo',
      role: UserRole.STUDENT,
      isActive: true,
    },
  });
  
  console.log({ dgeAdmin, teacher, student });
}

seedUsers()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });