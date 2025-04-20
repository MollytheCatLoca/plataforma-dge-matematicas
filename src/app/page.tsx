// src/app/page.tsx - Corregido
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-white p-8">
      <h1 className="text-4xl font-bold text-blue-800 mb-4 text-center">
        Bienvenido a la Plataforma Educativa de Matemáticas
      </h1>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-xl">
        Un espacio moderno para el aprendizaje interactivo y el seguimiento personalizado,
        impulsado por la Dirección General de Escuelas.
      </p>
      <div className="flex space-x-4">
        {/* Usar un <a> en lugar de Link para debugging */}
        <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
          Iniciar Sesión
        </a>
        {/* También prueba con Link normal */}
        {/* <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
          Iniciar Sesión
        </Link> */}
      </div>
    </div>
  );
}