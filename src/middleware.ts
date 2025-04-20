// src/middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Definir rutas públicas (accesibles sin autenticación)
  const publicPaths = ['/', '/login', '/register', '/forgot-password', '/api/seed'];
  const isPublicPath = publicPaths.includes(path) || 
                       path.startsWith('/api/auth/') ||
                       path.includes('.');
  
  // Obtener el token de la sesión
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Redirigir a login si no hay token y la ruta no es pública
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirigir al dashboard si ya hay sesión y el usuario intenta acceder a páginas de autenticación
  if (token && ['/login', '/register'].includes(path)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configurar en qué rutas se ejecutará el middleware
export const config = {
  matcher: [
    // Rutas a proteger
    '/dashboard/:path*',
    // Rutas de autenticación
    '/login',
    '/register'
  ],
};