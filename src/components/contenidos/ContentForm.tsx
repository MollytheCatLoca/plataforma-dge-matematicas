'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ContentType, ContentStatus, GradeLevel } from '@prisma/client';
import TextContentForm from './content-types/TextContentForm';
import VideoContentForm from './content-types/VideoContentForm';
import PdfContentForm from './content-types/PdfContentForm';
import SimulationContentForm from './content-types/SimulationContentForm';
import ExternalLinkForm from './content-types/ExternalLinkForm';

// Interfaces para tipado
export interface ContentFormData {
  title: string;
  description: string;
  summary: string;
  type: ContentType;
  status: ContentStatus;
  contentUrl?: string;
  imageUrl?: string;
  contentBody?: any;
  tags: string[];
  gradeLevels: GradeLevel[];
  curriculumNodeId?: string;
  authorName?: string;
  duration?: number;
  visibility: string;
}

interface CurriculumNode {
  id: string;
  name: string;
  nodeType: string;
  gradeLevel?: GradeLevel[];
  parentId?: string;
  parent?: {
    id: string;
    name: string;
  } | null;
}

interface ContentFormProps {
  initialData?: Partial<ContentFormData>;
  contentId?: string;
  isEditing?: boolean;
}

export default function ContentForm({ 
  initialData = {}, 
  contentId,
  isEditing = false 
}: ContentFormProps) {
  const router = useRouter();
  
  // Estado del formulario
  const [formData, setFormData] = useState<ContentFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    summary: initialData.summary || '',
    type: initialData.type || ContentType.TEXT_CONTENT,
    status: initialData.status || ContentStatus.DRAFT,
    contentUrl: initialData.contentUrl || '',
    imageUrl: initialData.imageUrl || '',
    contentBody: initialData.contentBody || null,
    tags: initialData.tags || [],
    gradeLevels: initialData.gradeLevels || [],
    curriculumNodeId: initialData.curriculumNodeId || '',
    authorName: initialData.authorName || '',
    duration: initialData.duration || 0,
    visibility: initialData.visibility || 'public'
  });

  // Estados para la UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [curriculumNodes, setCurriculumNodes] = useState<CurriculumNode[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Cargar nodos curriculares al iniciar
  useEffect(() => {
    async function loadCurriculumNodes() {
      try {
        const response = await fetch('/api/curriculum-nodes');
        if (!response.ok) throw new Error('Error al cargar nodos curriculares');
        const data = await response.json();
        setCurriculumNodes(data);
      } catch (error) {
        console.error('Error loading curriculum nodes:', error);
        setError('No se pudieron cargar los nodos curriculares. Por favor, intenta de nuevo.');
      }
    }
    
    loadCurriculumNodes();
  }, []);

  // Manejar cambios en inputs básicos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en checkbox (gradeLevels)
  const handleGradeLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const gradeLevel = value as GradeLevel;
    
    setFormData(prev => ({
      ...prev,
      gradeLevels: checked 
        ? [...prev.gradeLevels, gradeLevel]
        : prev.gradeLevels.filter(g => g !== gradeLevel)
    }));
  };

  // Manejar etiquetas (tags)
  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Manejar cambios en el contenido específico según el tipo
  const handleContentDataChange = (data: any) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  // Validar el formulario
  const validateForm = (): boolean => {
    // Validación básica
    if (!formData.title.trim()) {
      setError('El título es obligatorio');
      return false;
    }

    // Validación específica según el tipo
    switch (formData.type) {
      case ContentType.VIDEO:
      case ContentType.PDF:
      case ContentType.EXTERNAL_LINK:
        if (!formData.contentUrl) {
          setError(`La URL es obligatoria para contenido tipo ${formData.type}`);
          return false;
        }
        break;
      case ContentType.SIMULATION:
        if (!formData.contentBody) {
          setError('La configuración de la simulación es obligatoria');
          return false;
        }
        break;
    }

    return true;
  };

  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Determinar si es creación o actualización
      const url = isEditing 
        ? `/api/contenidos/${contentId}` 
        : '/api/contenidos';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar el contenido');
      }

      const result = await response.json();
      
      setSuccess(isEditing 
        ? 'Contenido actualizado correctamente' 
        : 'Contenido creado correctamente'
      );

      // Redireccionar después de un breve retraso
      setTimeout(() => {
        router.push(isEditing 
          ? `/dashboard/contenidos/${contentId}` 
          : `/dashboard/contenidos/${result.id}`
        );
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Error saving content:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar formulario específico según el tipo de contenido
  const renderContentTypeForm = () => {
    switch (formData.type) {
      case ContentType.TEXT_CONTENT:
        return (
          <TextContentForm 
            data={formData} 
            onChange={handleContentDataChange} 
          />
        );
      case ContentType.VIDEO:
        return (
          <VideoContentForm 
            data={formData} 
            onChange={handleContentDataChange} 
          />
        );
      case ContentType.PDF:
        return (
          <PdfContentForm 
            data={formData} 
            onChange={handleContentDataChange} 
          />
        );
      case ContentType.SIMULATION:
        return (
          <SimulationContentForm 
            data={formData} 
            onChange={handleContentDataChange} 
          />
        );
      case ContentType.EXTERNAL_LINK:
        return (
          <ExternalLinkForm 
            data={formData} 
            onChange={handleContentDataChange} 
          />
        );
      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700">
              El tipo de contenido seleccionado no tiene un formulario específico implementado.
              Por favor, introduce los datos básicos y la URL del contenido si es aplicable.
            </p>
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mensajes de éxito o error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          {success}
        </div>
      )}
      
      {/* Sección 1: Información básica */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Información Básica</h2>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Título */}
          <div className="col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Resumen */}
          <div className="col-span-2">
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
              Resumen
            </label>
            <input
              type="text"
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Breve descripción para vistas previas (120 caracteres máx.)"
              maxLength={120}
            />
          </div>
          
          {/* Descripción */}
          <div className="col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              Puedes usar formato de texto enriquecido y notación matemática entre $ símbolos.
            </p>
          </div>
          
          {/* Tipo de Contenido */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Contenido <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={ContentType.TEXT_CONTENT}>Texto</option>
              <option value={ContentType.VIDEO}>Video</option>
              <option value={ContentType.PDF}>PDF</option>
              <option value={ContentType.SIMULATION}>Simulación</option>
              <option value={ContentType.EXTERNAL_LINK}>Enlace Externo</option>
              <option value={ContentType.EXERCISE_SET}>Conjunto de Ejercicios</option>
              <option value={ContentType.EVALUATION}>Evaluación</option>
              <option value={ContentType.IMAGE}>Imagen</option>
            </select>
          </div>
          
          {/* Estado */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={ContentStatus.DRAFT}>Borrador</option>
              <option value={ContentStatus.PUBLISHED}>Publicado</option>
              <option value={ContentStatus.ARCHIVED}>Archivado</option>
            </select>
          </div>
          
          {/* Imagen de Portada */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL de Imagen de Portada
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
          
          {/* Duración (en minutos) */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duración (minutos)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration || ''}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Autor */}
          <div>
            <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
              Autor (si es diferente al usuario actual)
            </label>
            <input
              type="text"
              id="authorName"
              name="authorName"
              value={formData.authorName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Visibilidad */}
          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
              Visibilidad
            </label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Público</option>
              <option value="private">Privado</option>
              <option value="restricted">Restringido</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Sección 2: Formulario específico según el tipo de contenido */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Contenido Específico
        </h2>
        
        {renderContentTypeForm()}
      </div>
      
      {/* Sección 3: Categorización y Metadatos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Categorización</h2>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Nodo Curricular */}
          <div className="col-span-2">
            <label htmlFor="curriculumNodeId" className="block text-sm font-medium text-gray-700 mb-1">
              Nodo Curricular
            </label>
            <select
              id="curriculumNodeId"
              name="curriculumNodeId"
              value={formData.curriculumNodeId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Seleccionar nodo curricular --</option>
              {curriculumNodes.map(node => (
                <option key={node.id} value={node.id}>
                  {node.name} 
                  {node.parent ? ` (en ${node.parent.name})` : ''} 
                  {node.gradeLevel && node.gradeLevel.length > 0 
                    ? ` - ${node.gradeLevel.join(', ')}` 
                    : ''}
                </option>
              ))}
            </select>
          </div>
          
          {/* Años/Grados */}
          <div className="col-span-2">
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-2">
                Años/Grados Aplicables
              </legend>
              <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-3 gap-x-4">
                <div className="flex items-center">
                  <input
                    id="FIRST"
                    name="gradeLevels"
                    type="checkbox"
                    value={GradeLevel.FIRST}
                    checked={formData.gradeLevels.includes(GradeLevel.FIRST)}
                    onChange={handleGradeLevelChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="FIRST" className="ml-2 block text-sm text-gray-700">
                    Primer Año
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="SECOND"
                    name="gradeLevels"
                    type="checkbox"
                    value={GradeLevel.SECOND}
                    checked={formData.gradeLevels.includes(GradeLevel.SECOND)}
                    onChange={handleGradeLevelChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="SECOND" className="ml-2 block text-sm text-gray-700">
                    Segundo Año
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="THIRD"
                    name="gradeLevels"
                    type="checkbox"
                    value={GradeLevel.THIRD}
                    checked={formData.gradeLevels.includes(GradeLevel.THIRD)}
                    onChange={handleGradeLevelChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="THIRD" className="ml-2 block text-sm text-gray-700">
                    Tercer Año
                  </label>
                </div>
              </div>
            </fieldset>
          </div>
          
          {/* Etiquetas */}
          <div className="col-span-2">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Etiquetas
            </label>
            <div className="flex">
              <input
                type="text"
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleTagAdd();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Añadir etiqueta y presionar Enter"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                Añadir
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <div key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => handleTagRemove(tag)}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              Las etiquetas facilitan la búsqueda y categorización de contenidos.
            </p>
          </div>
        </div>
      </div>
      
      {/* Botones de acción */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar Contenido' : 'Crear Contenido'}
        </button>
      </div>
    </form>
  );
}