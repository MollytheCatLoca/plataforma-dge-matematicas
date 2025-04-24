// src/components/curriculum/CurriculumNodeForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GradeLevel, NodeType } from '@prisma/client';

interface ParentNode {
  id: string;
  name: string;
  nodeType: NodeType;
}

interface CurriculumNodeFormProps {
  parentNodes: ParentNode[];
  initialData?: {
    id?: string;
    name: string;
    description?: string;
    nodeType: NodeType;
    parentId?: string;
    order?: number;
    gradeLevel?: GradeLevel[];
  };
}

export default function CurriculumNodeForm({ parentNodes, initialData }: CurriculumNodeFormProps) {
  const router = useRouter();
  const isEditing = !!initialData?.id;
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    nodeType: initialData?.nodeType || NodeType.GENERIC,
    parentId: initialData?.parentId || '',
    order: initialData?.order || 0,
    gradeLevel: initialData?.gradeLevel || []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const nodeTypeOptions = [
    { value: NodeType.YEAR, label: 'Año Escolar' },
    { value: NodeType.AXIS, label: 'Eje Temático' },
    { value: NodeType.UNIT, label: 'Unidad Didáctica' },
    { value: NodeType.TOPIC, label: 'Tema' },
    { value: NodeType.CONCEPT, label: 'Concepto' },
    { value: NodeType.GENERIC, label: 'Genérico' },
  ];
  
  const gradeLevelOptions = [
    { value: GradeLevel.FIRST, label: 'Primer Año' },
    { value: GradeLevel.SECOND, label: 'Segundo Año' },
    { value: GradeLevel.THIRD, label: 'Tercer Año' },
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error si se corrige
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleGradeLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const grade = value as GradeLevel;
    
    setFormData(prev => ({
      ...prev,
      gradeLevel: checked 
        ? [...prev.gradeLevel, grade]
        : prev.gradeLevel.filter(g => g !== grade)
    }));
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    // Si es un año escolar o un eje temático principal, debería tener asignado al menos un grado
    if ((formData.nodeType === NodeType.YEAR || 
         (formData.nodeType === NodeType.AXIS && !formData.parentId)) && 
        formData.gradeLevel.length === 0) {
      newErrors.gradeLevel = 'Debe seleccionar al menos un año escolar';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const url = isEditing 
        ? `/api/curriculum/${initialData.id}` 
        : '/api/curriculum';
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar el nodo curricular');
      }
      
      setMessage({ 
        type: 'success', 
        text: isEditing ? 'Nodo actualizado correctamente' : 'Nodo creado correctamente' 
      });
      
      // Redirigir después de un breve retraso
      setTimeout(() => {
        router.push('/dashboard/curriculum');
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Error saving curriculum node:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al guardar' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="nodeType" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Nodo *
          </label>
          <select
            id="nodeType"
            name="nodeType"
            value={formData.nodeType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {nodeTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
            Nodo Padre
          </label>
          <select
            id="parentId"
            name="parentId"
            value={formData.parentId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Ninguno (Nodo Raíz) --</option>
            {parentNodes.map(node => (
              <option key={node.id} value={node.id}>
                {node.name} ({node.nodeType})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
            Orden
          </label>
          <input
            type="number"
            id="order"
            name="order"
            value={formData.order}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Define el orden de aparición entre nodos del mismo nivel
          </p>
        </div>
      </div>
      
      <div>
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            Años/Grados Asociados
          </legend>
          <div className="space-y-2">
            {gradeLevelOptions.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`grade-${option.value}`}
                  name="gradeLevel"
                  value={option.value}
                  checked={formData.gradeLevel.includes(option.value)}
                  onChange={handleGradeLevelChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`grade-${option.value}`} className="ml-2 block text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
          {errors.gradeLevel && (
            <p className="mt-1 text-sm text-red-600">{errors.gradeLevel}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Selecciona los años escolares a los que aplica este nodo curricular. 
            Esto es crucial para la organización de secuencias y contenidos.
          </p>
        </fieldset>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.push('/dashboard/curriculum')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Nodo'}
        </button>
      </div>
    </form>
  );
}