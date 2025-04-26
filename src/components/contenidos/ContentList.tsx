'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import type { ContentStatus, ContentType, GradeLevel, UserRole } from '@/types/content';
import type { ContentResource } from '@/types/contentResource';

const ITEMS_PER_PAGE = 20;

/* ---------- helpers ---------- */

const typeNames: Record<ContentType, string> = {
  TEXT_CONTENT: 'Texto',
  VIDEO: 'Video',
  PDF: 'PDF',
  SIMULATION: 'Simulación',
  EXERCISE_SET: 'Ejercicios',
  EVALUATION: 'Evaluación',
  EXTERNAL_LINK: 'Enlace Externo',
  IMAGE: 'Imagen',
};

const typeColors: Record<ContentType, string> = {
  TEXT_CONTENT: 'bg-blue-100 text-blue-800',
  VIDEO: 'bg-red-100 text-red-800',
  PDF: 'bg-yellow-100 text-yellow-800',
  SIMULATION: 'bg-green-100 text-green-800',
  EXERCISE_SET: 'bg-indigo-100 text-indigo-800',
  EVALUATION: 'bg-purple-100 text-purple-800',
  EXTERNAL_LINK: 'bg-teal-100 text-teal-800',
  IMAGE: 'bg-pink-100 text-pink-800',
};

const statusColors: Record<ContentStatus, string> = {
  PUBLISHED: 'bg-green-100 text-green-800',
  DRAFT: 'bg-gray-100 text-gray-800',
  ARCHIVED: 'bg-red-100 text-red-800',
};

/* ---------- componente ---------- */

export default function ContentList() {
  const { data: session, status: sessionStatus } = useSession();

  /* estado UI */
  const [ready, setReady] = useState(sessionStatus === 'authenticated');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contents, setContents] = useState<ContentResource[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    gradeLevel: '',
    curriculumNodeId: '',
    search: '',
    tags: [] as string[],
  });

  /* quién puede gestionar */
  const canManage =
    session?.user.role === 'TEACHER' ||
    session?.user.role === 'SCHOOL_ADMIN' ||
    session?.user.role === 'DGE_ADMIN';

  /* detecta login/logout */
  useEffect(() => {
    setReady(sessionStatus === 'authenticated');
  }, [sessionStatus]);

  /* fetch reutilizable */
  const fetchContents = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    setError('');
    try {
      const skip = (page - 1) * ITEMS_PER_PAGE;
      const params = new URLSearchParams({
        skip: String(skip),
        take: String(ITEMS_PER_PAGE),
      });

      Object.entries(filters).forEach(([k, v]) => {
        if (Array.isArray(v) && v.length) params.append(k, v.join(','));
        else if (v) params.append(k, String(v));
      });

      const res = await fetch(`/api/contenidos?${params.toString()}`, {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const items: ContentResource[] = Array.isArray(data) ? data : data.contents;
      setContents(items);
      setTotal(Array.isArray(data) ? items.length : data.pagination?.total ?? items.length);
    } catch (err: any) {
      setError(err.message ?? 'Error inesperado');
      setContents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [ready, page, filters]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  /* handlers UI */
  const setFilter = (k: string, v: string) => {
    setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };
  const prev = () => setPage((p) => Math.max(p - 1, 1));
  const next = () => setPage((p) => p + 1);

  const del = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este contenido?')) return;
    const res = await fetch(`/api/contenidos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Error al eliminar');
      return;
    }
    setContents((c) => c.filter((x) => x.id !== id));
    setTotal((t) => t - 1);
  };

  /* ---------- render ---------- */

  if (!ready) return null;
  if (loading) return <p className="p-6 text-center">Cargando…</p>;

  return (
    <div className="space-y-6">
      {/* barra de filtros y botón crear */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {canManage && (
          <Link
            href="/dashboard/contenidos/crear"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <span className="mr-2">＋</span>Crear Contenido
          </Link>
        )}
        <div className="flex flex-wrap gap-2">
          <select value={filters.type} onChange={(e) => setFilter('type', e.target.value)} className="select">
            <option value="">Todos los tipos</option>
            {Object.values(typeNames).map((label, i) => {
              const key = Object.keys(typeNames)[i] as ContentType;
              return (
                <option key={key} value={key}>
                  {label}
                </option>
              );
            })}
          </select>

          {canManage && (
            <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className="select">
              <option value="">Todos los estados</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="DRAFT">Borrador</option>
              <option value="ARCHIVED">Archivado</option>
            </select>
          )}

          <select value={filters.gradeLevel} onChange={(e) => setFilter('gradeLevel', e.target.value)} className="select">
            <option value="">Todos los años</option>
            <option value="FIRST">1° Año</option>
            <option value="SECOND">2° Año</option>
            <option value="THIRD">3° Año</option>
          </select>

          <input
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder="Buscar…"
            className="px-3 py-2 border rounded-md text-sm"
          />
        </div>
      </div>

      {/* errores */}
      {error && <p className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">{error}</p>}

      {/* tabla */}
      {contents.length === 0 && !error ? (
        <p className="p-6 text-center">No se encontraron contenidos</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th">Contenido</th>
                <th className="th">Tipo</th>
                <th className="th">Estado</th>
                <th className="th">Año / Grado</th>
                <th className="th">Fecha</th>
                <th className="th text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {contents.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  {/* contenido + imagen */}
                  <td className="td">
                    <div className="flex items-center">
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt={c.title} className="h-10 w-10 rounded-md object-cover mr-3" />
                      ) : (
                        <span className={`h-10 w-10 flex items-center justify-center rounded-md mr-3 ${typeColors[c.type]}`}>
                          {typeNames[c.type].slice(0, 2)}
                        </span>
                      )}
                      <div>
                        <Link href={`/dashboard/contenidos/${c.id}`} className="text-sm font-medium hover:text-blue-600">
                          {c.title}
                        </Link>
                        <p className="text-sm text-gray-500 truncate max-w-md">
                          {c.summary || c.description || 'Sin descripción'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* tipo */}
                  <td className="td">
                    <span className={`badge ${typeColors[c.type]}`}>{typeNames[c.type]}</span>
                  </td>

                  {/* estado */}
                  <td className="td">
                    <span className={`badge ${statusColors[c.status]}`}>
                      {c.status === 'PUBLISHED' ? 'Publicado' : c.status === 'DRAFT' ? 'Borrador' : 'Archivado'}
                    </span>
                  </td>

                  {/* grado */}
                  <td className="td text-sm text-gray-500">
                    {c.gradeLevels?.length ? (
                      c.gradeLevels.map((g) => (
                        <span key={g} className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs mr-1">
                          {g === 'FIRST' ? '1°' : g === 'SECOND' ? '2°' : '3°'}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">No especificado</span>
                    )}
                  </td>

                  {/* fecha */}
                  <td className="td text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>

                  {/* acciones */}
                  <td className="td text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/contenidos/${c.id}`} className="text-blue-600 hover:text-blue-900">👁</Link>
                      {canManage && (
                        <>
                          <Link href={`/dashboard/contenidos/${c.id}/editar`} className="text-yellow-600 hover:text-yellow-900">✏</Link>
                          <button onClick={() => del(c.id)} className="text-red-600 hover:text-red-900">🗑</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* paginación */}
      {total > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}</span> a{' '}
            <span className="font-medium">{Math.min(page * ITEMS_PER_PAGE, total)}</span> de{' '}
            <span className="font-medium">{total}</span>
          </p>
          <div className="flex gap-2">
            <button onClick={prev} disabled={page === 1} className="btn">Anterior</button>
            <button onClick={next} disabled={page * ITEMS_PER_PAGE >= total} className="btn">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- estilos tailwind reutilizables ---------- */
/* Podés mover estos a tu CSS global si querés */
const td = 'px-6 py-4 whitespace-nowrap';
const th = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
const badge = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
const select = 'px-3 py-2 border border-gray-300 rounded-md text-sm';
const btn = 'px-3 py-2 border rounded-md text-sm enabled:hover:bg-gray-50 disabled:opacity-50';
