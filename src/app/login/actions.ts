// src/app/login/actions.ts
'use server'; // Marca este módulo para que se ejecute SOLO en el servidor

import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
// Importaremos funciones de sesión más tarde (ej. de next-auth)

export async function authenticate(email: string, password: string) {
  console.log(`Authenticating user: ${email}`); // Log de servidor

  if (!email || !password) {
    return { error: 'Correo electrónico y contraseña son requeridos.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      console.log(`User not found: ${email}`);
      return { error: 'Credenciales inválidas.' }; // Mensaje genérico
    }

    if (!user.hashedPassword) {
       // Seguridad: Si un usuario existe sin contraseña hasheada, algo está mal
       console.error(`User ${email} has no hashed password set.`);
       return { error: 'Error de autenticación. Contacte al administrador.' };
    }

    // Comparar la contraseña ingresada con la hasheada en la DB
    const passwordsMatch = await bcrypt.compare(password, user.hashedPassword);

    if (passwordsMatch) {
      console.log(`Authentication successful for: ${email}`);
      // --- Aquí iría la lógica para crear la sesión del usuario ---
      // Por ejemplo, usando next-auth: signIn(...)
      // O creando un JWT y enviándolo como cookie
      // --- Por ahora, solo retornamos éxito ---
      return { success: true, userId: user.id, role: user.role }; // Puedes retornar datos del usuario
    } else {
      console.log(`Invalid password for: ${email}`);
      return { error: 'Credenciales inválidas.' }; // Mensaje genérico
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Ocurrió un error en el servidor durante la autenticación.' };
  }
}