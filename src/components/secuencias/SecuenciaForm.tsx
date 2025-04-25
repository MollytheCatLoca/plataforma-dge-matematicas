// src/components/secuencias/SecuenciaForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GradeLevel, NodeType } from '@prisma/client';

interface SecuenciaFormProps {
  secuenciaId: string;
  initialData: {
    name: string;
    description: string;
    curriculumNodeId: string;
    isTemplate: boolean;
  };
}

// Función auxiliar para mostrar nombres de grados
function getGradeLevelText(gradeLevel: GradeLevel): string {
  const gradeLevelMap: Record<GradeLevel, string> = {
    FIRST: "Primer año",
    SECOND: "Segundo año",
    THIRD: "Tercer año"
  };
  
  return gradeLevelMap[gradeLevel] || gradeLevel;
}

export default function SecuenciaForm({ secuenciaId, initialData }: SecuenciaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Datos del formulario
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description);
  const [curriculumNodeId, setCurriculumNodeId] = useState(initialData.curriculumNodeId);
  const [isTemplate, setIsTemplate] = useState(initialData.isTemplate);
  
  // Estados para la UI
  const [curriculumNodes, setCurriculumNodes] = useState<Array<any>>([]);
  const [selectedNodeGrades, setSelectedNodeGrades] = useState<GradeLevel[]>([]);
  const [showGradeWarning, setShowGradeWarning] = useState(false);

  // Cargar los nodos curriculares
  // Modifica el useEffect para cargar los nodos curriculares así:
// Modificar el useEffect en SecuenciaForm.tsx
useEffect(() => {
  async function loadCurriculumNodes() {
    try {
      const res = await fetch('/api/curriculum-nodes');
      if (!res.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      
      const data = await res.json();
      console.log('Datos recibidos de la API:', data); // Para depuración
      
      // Si la respuesta es un array, úsalo directamente
      // Si tiene una propiedad nodes, usa esa propiedad
      const nodesArray = Array.isArray(data) ? data : data.nodes || [];
      
      setCurriculumNodes(nodesArray);
      
      // Si hay un nodo seleccionado, mostrar sus grados
      if (curriculumNodeId) {
        const selectedNode = nodesArray.find((node) => node.id === curriculumNodeId);
        if (selectedNode && selectedNode.gradeLevel) {
          setSelectedNodeGrades(selectedNode.gradeLevel);
        }
      }
    } catch (err) {
      console.error('Error al cargar nodos curriculares:', err);
    }
  }
  
  loadCurriculumNodes();
}, [curriculumNodeId]); // Agregamos curriculumNodeId como dependencia

  // Actualizar grados cuando cambia el nodo seleccionado
  const handleNodeChange = (nodeId: string) => {
    setCurriculumNodeId(nodeId);
    
    if (!nodeId) {
      setSelectedNodeGrades([]);
      setShowGradeWarning(true);
      return;
    }
    
    const selectedNode = curriculumNodes.find(node => node.id === nodeId);
    if (selectedNode && selectedNode.gradeLevel) {
      setSelectedNodeGrades(selectedNode.gradeLevel);
      setShowGradeWarning(selectedNode.gradeLevel.length === 0);
    } else {
      setSelectedNodeGrades([]);
      setShowGradeWarning(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validar que hay al menos un grado seleccionado (a través del nodo curricular)
    if (selectedNodeGrades.length === 0) {
      setError('Es necesario seleccionar un nodo curricular que tenga al menos un año/grado asignado');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/secuencias/${secuenciaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          curriculumNodeId,
          isTemplate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar la secuencia');
      }

      setSuccess('Secuencia actualizada correctamente');
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la secuencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md">
          {success}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la secuencia *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={3}
        />
      </div>
      
      <div>
        <label htmlFor="curriculumNodeId" className="block text-sm font-medium text-gray-700 mb-1">
          Nodo curricular (determina los años/grados) *
        </label>
        <select
          id="curriculumNodeId"
          value={curriculumNodeId}
          onChange={(e) => handleNodeChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="">-- Seleccionar nodo curricular --</option>
          {curriculumNodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.name} ({node.nodeType})
            </option>
          ))}
        </select>
      </div>
      
      {/* Mostrar los grados/años asociados al nodo seleccionado */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          Años/Grados asociados:
        </p>
        {selectedNodeGrades.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedNodeGrades.map((grade) => (
              <span key={grade} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {getGradeLevelText(grade)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-yellow-600">
            No hay años/grados asignados al nodo seleccionado. Es recomendable seleccionar un nodo con al menos un año asignado.
          </p>
        )}
      </div>
      
      <div className="flex items-center">
        <input
          id="isTemplate"
          type="checkbox"
          checked={isTemplate}
          onChange={(e) => setIsTemplate(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="isTemplate" className="ml-2 block text-sm text-gray-700">
          Es una plantilla (puede ser reutilizada por otros profesores)
        </label>
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}