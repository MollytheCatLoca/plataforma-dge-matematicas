// src/app/dashboard/contenidos/page.tsx
import MathRenderer from '@/components/MathRenderer';

export default function ContenidosPage() {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-4">Contenidos</h1>
        <p className="text-gray-600 mb-6">
          Gestiona los contenidos educativos de la plataforma.
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>Próximamente: Listado de contenidos educativos</p>
          <div className="mt-2 text-sm text-gray-600 line-clamp-2">
  {contentResource.description ? (
    <MathRenderer text={contentResource.description} />
  ) : (
    <span className="italic">Sin descripción</span>
  )}
</div>
          <div className="mt-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">Agregar Contenido</button>
          </div>
          <div className="mt-4">
            <button className="bg-green-500 text-white px-4 py-2 rounded">Ver Contenidos</button>
          </div>
          <div className="mt-4">
            <button className="bg-red-500 text-white px-4 py-2 rounded">Eliminar Contenido</button>
          </div>
          <div className="mt-4">
            <button className="bg-yellow-500 text-white px-4 py-2 rounded">Actualizar Contenido</button>
          </div>
          <div className="mt-4">
            <button className="bg-purple-500 text-white px-4 py-2 rounded">Detalles del Contenido</button>
          </div>
        </div>
      </div>
    );
  }