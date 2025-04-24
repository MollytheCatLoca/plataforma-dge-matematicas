// src/components/secuencias/ContenidosSecuencia.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { debounce } from 'lodash';
import { useRouter } from 'next/navigation';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Link from 'next/link';
import { GradeLevel } from '@prisma/client';

// Interfaces para los tipos de datos
interface ContentResource {
  id: string;
  title: string;
  type: string;
  status: string;
  description?: string | null;
  gradeLevels?: GradeLevel[]; // Añadimos gradeLevels para verificar compatibilidad
}

interface SequencePosition {
  id: string;
  contentResourceId: string;
  position: number;
  isOptional: boolean;
  contentResource: ContentResource;
}

interface LearningSequence {
  id: string;
  name: string;
  contents: SequencePosition[];
  curriculumNode?: {
    id: string;
    name: string;
    nodeType: string;
    gradeLevel?: GradeLevel[];
  } | null;
}

interface ContentItemProps {
  item: SequencePosition;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  removeItem: (id: string) => void;
  toggleOptional: (id: string, isOptional: boolean) => void;
  sequenceGradeLevels: GradeLevel[];
}

// Función auxiliar para mostrar nombres de grados
function getGradeLevelText(gradeLevel: GradeLevel): string {
  const gradeLevelMap: Record<GradeLevel, string> = {
    FIRST: "1º",
    SECOND: "2º",
    THIRD: "3º"
  };
  
  return gradeLevelMap[gradeLevel] || gradeLevel;
}

// Componente para cada elemento arrastrable en la secuencia
const ContentItem = ({ 
  item, 
  index, 
  moveItem, 
  removeItem, 
  toggleOptional,
  sequenceGradeLevels 
}: ContentItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Verificar compatibilidad de años/grados
  const contentGradeLevels = item.contentResource.gradeLevels || [];
  const hasGradeLevelMismatch = sequenceGradeLevels.length > 0 && 
                               contentGradeLevels.length > 0 && 
                               !contentGradeLevels.some(gl => sequenceGradeLevels.includes(gl));
  
  const [{ isDragging }, drag] = useDrag({
    type: 'CONTENT_ITEM',
    item: { id: item.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'CONTENT_ITEM',
    hover: (draggedItem: { id: string; index: number }, monitor) => {
      if (!ref.current) return;
      
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      
      // No reemplazar elementos consigo mismos
      if (dragIndex === hoverIndex) return;
      
      // Determinar rectángulo en pantalla
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Obtener punto medio vertical
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determinar posición del mouse
      const clientOffset = monitor.getClientOffset();
      
      // Obtener píxeles al top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      
      // Solo realizar movimiento cuando el mouse haya cruzado la mitad de la altura del elemento
      // Cuando se arrastra hacia abajo, solo mover cuando el cursor esté por debajo del 50%
      // Cuando se arrastra hacia arriba, solo mover cuando el cursor esté por encima del 50%
      
      // Arrastrar hacia abajo
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      
      // Arrastrar hacia arriba
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      
      // Realizar el movimiento
      moveItem(dragIndex, hoverIndex);
      
      // Actualizar el índice en el elemento arrastrado
      draggedItem.index = hoverIndex;
    },
  });
  
  // Combinar los refs para arrastrar y soltar
  drag(drop(ref));
  
  return (
    <div 
      ref={ref}
      className={`border rounded-md p-4 mb-3 ${
        isDragging ? 'opacity-50 bg-gray-100' : 'bg-white'
      } ${
        hasGradeLevelMismatch ? 'border-l-4 border-l-yellow-400' : ''
      } transition-colors cursor-move`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="text-gray-500">
            <span className="font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
              {index + 1}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="font-medium text-gray-900">{item.contentResource.title}</h3>
              
              {/* Mostrar niveles/grados del contenido si están definidos */}
              {contentGradeLevels.length > 0 && (
                <div className="ml-2 flex space-x-1">
                  {contentGradeLevels.map(grade => (
                    <span 
                      key={grade} 
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        sequenceGradeLevels.includes(grade) 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {getGradeLevelText(grade)}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-500 flex items-center space-x-2 mt-1">
              <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                {item.contentResource.type}
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                {item.contentResource.status}
              </span>
              
              {/* Alerta de incompatibilidad de grados */}
              {hasGradeLevelMismatch && (
                <span className="text-xs text-yellow-600 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Años no compatibles
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleOptional(item.id, !item.isOptional)}
            className={`px-2 py-1 text-xs rounded ${
              item.isOptional 
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
              : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
            title={item.isOptional ? "Marcar como requerido" : "Marcar como opcional"}
          >
            {item.isOptional ? 'Opcional' : 'Requerido'}
          </button>
          <Link
            href={`/dashboard/contenidos/${item.contentResource.id}`}
            className="text-blue-500 hover:text-blue-700 p-1"
            title="Ver contenido"
            target="_blank"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>
          <button
            onClick={() => removeItem(item.id)}
            className="text-red-500 hover:text-red-700 p-1"
            title="Eliminar de la secuencia"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente principal para gestionar los contenidos de la secuencia
export default function ContenidosSecuencia({ secuencia }: { secuencia: LearningSequence }) {
  const router = useRouter();
  const [items, setItems] = useState<SequencePosition[]>([]);
  const [availableContents, setAvailableContents] = useState<ContentResource[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByGrade, setFilterByGrade] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshAvailableContents = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);
  
  // Obtener los niveles de grado de la secuencia (a través del nodo curricular)
  const sequenceGradeLevels = secuencia.curriculumNode?.gradeLevel || [];
  
  // Añadir debounce para cambios en filterByGrade
  const debouncedFilterChange = useCallback(
    debounce((value: boolean) => {
      setFilterByGrade(value);
    }, 300),
    []
  );

  // Cargar los contenidos de la secuencia
  useEffect(() => {
    if (secuencia && secuencia.contents) {
      setItems(secuencia.contents);
    }
  }, [secuencia]);

  // Actualizar existingContentIds cuando items cambien realmente
  useEffect(() => {
    setItems(items => items.map((item, idx) => ({ ...item, position: idx + 1 })));
  }, [items]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const excludeIds = items.map(item => item.contentResourceId);
      const gradeFilter = filterByGrade && sequenceGradeLevels.length > 0 
        ? `&grades=${sequenceGradeLevels.join(',')}` 
        : '';
      fetch(`/api/contenidos?exclude=${excludeIds.join(',')}&status=PUBLISHED${gradeFilter}`)
        .then(response => {
          if (!response.ok) throw new Error('Error al cargar contenidos disponibles');
          return response.json();
        })
        .then(data => {
          setAvailableContents(data);
        })
        .catch(err => {
          console.error('Error fetching available contents:', err);
          setMessage({ type: 'error', text: 'Error al cargar contenidos disponibles' });
        });
    }, 500);
    return () => clearTimeout(timer);
  }, [items, filterByGrade, sequenceGradeLevels, refreshKey]);

  // Filtrar contenidos disponibles por término de búsqueda
  const filteredContents = searchTerm
    ? availableContents.filter(content => 
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableContents;
  
  // Verificar compatibilidad de grados
  useEffect(() => {
    // Si la secuencia tiene grados asignados, verificar cada contenido
    if (sequenceGradeLevels.length > 0) {
      const incompatibleContents = items.filter(item => {
        const contentGrades = item.contentResource.gradeLevels || [];
        return contentGrades.length > 0 && !contentGrades.some(g => sequenceGradeLevels.includes(g));
      });
      
      if (incompatibleContents.length > 0) {
        setMessage({ 
          type: 'warning', 
          text: `Hay ${incompatibleContents.length} contenido(s) con años/grados no compatibles con esta secuencia.` 
        });
      }
    }
  }, [items, sequenceGradeLevels]);
  
  // Función para mover un elemento de la secuencia
  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const draggedItem = items[dragIndex];
    if (!draggedItem) return;
    
    const updatedItems = [...items];
    // Eliminar el ítem de su posición actual
    updatedItems.splice(dragIndex, 1);
    // Insertarlo en la nueva posición
    updatedItems.splice(hoverIndex, 0, draggedItem);
    
    // Actualizar las posiciones
    const reorderedItems = updatedItems.map((item, idx) => ({
      ...item,
      position: idx + 1
    }));
    
    setItems(reorderedItems);
  };
  
  // Función para eliminar un elemento de la secuencia
  const removeItem = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este contenido de la secuencia?')) return;
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch(`/api/secuencias/${secuencia.id}/contents/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el contenido');
      }
      
      // Actualizar la lista local
      setItems(items.filter(item => item.id !== id));
      setMessage({ type: 'success', text: 'Contenido eliminado de la secuencia' });
      refreshAvailableContents();
    } catch (err) {
      console.error('Error removing content:', err);
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Error al eliminar el contenido' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para cambiar el estado opcional/requerido de un contenido
  const toggleOptional = async (id: string, isOptional: boolean) => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch(`/api/secuencias/${secuencia.id}/contents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOptional })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el contenido');
      }
      
      // Actualizar la lista local
      setItems(items.map(item => 
        item.id === id ? { ...item, isOptional } : item
      ));
      
      setMessage({ 
        type: 'success', 
        text: `Contenido marcado como ${isOptional ? 'opcional' : 'requerido'}` 
      });
    } catch (err) {
      console.error('Error updating content:', err);
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Error al actualizar el contenido' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para agregar un nuevo contenido a la secuencia
  const addContent = async () => {
    if (!selectedContentId) {
      setMessage({ type: 'error', text: 'Selecciona un contenido para agregar' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      // La posición será la siguiente disponible
      const position = items.length > 0 
        ? Math.max(...items.map(item => item.position)) + 1 
        : 1;
      
      const response = await fetch(`/api/secuencias/${secuencia.id}/contents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentResourceId: selectedContentId,
          position,
          isOptional: false
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al agregar el contenido');
      }
      
      const newPosition = await response.json();
      
      // Buscar el contenido completo para mostrarlo correctamente
      const contentResource = availableContents.find(
        content => content.id === selectedContentId
      );
      
      if (contentResource) {
        // Añadir el nuevo ítem a la lista
        setItems([...items, { ...newPosition, contentResource }]);
        setMessage({ type: 'success', text: 'Contenido agregado correctamente' });
        setSelectedContentId(''); // Limpiar selección
        refreshAvailableContents();
      }
    } catch (err) {
      console.error('Error adding content:', err);
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Error al agregar el contenido' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para guardar el orden de los elementos
  const saveOrder = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch(`/api/secuencias/${secuencia.id}/order`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          positions: items.map(item => ({
            id: item.id,
            position: item.position
          }))
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el orden');
      }
      
      setMessage({ type: 'success', text: 'Orden guardado correctamente' });
      router.refresh();
    } catch (err) {
      console.error('Error saving order:', err);
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Error al guardar el orden' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      {message && (
        <div className={`p-3 mb-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 
          message.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
          'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      {/* Información sobre años/grados de la secuencia */}
      {sequenceGradeLevels.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <h3 className="font-medium text-blue-700 mb-1">
            Esta secuencia está asociada a:
          </h3>
          <div className="flex space-x-2">
            {sequenceGradeLevels.map(grade => (
              <span 
                key={grade}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium"
              >
                {getGradeLevelText(grade)}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Sección para agregar nuevo contenido */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="font-medium text-gray-700 mb-3">Agregar nuevo contenido</h3>
        <div className="mb-3">
          <input
            type="text"
            placeholder="Buscar contenidos por título o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        
        {sequenceGradeLevels.length > 0 && (
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="filterByGrade"
              checked={filterByGrade}
              onChange={(e) => debouncedFilterChange(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="filterByGrade" className="ml-2 text-sm text-gray-700">
              Solo mostrar contenidos compatibles con los años de esta secuencia
            </label>
          </div>
        )}
        
        <div className="flex space-x-2">
          <select
            value={selectedContentId}
            onChange={(e) => setSelectedContentId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="">-- Seleccionar contenido --</option>
            {filteredContents.map(content => {
              // Verificar compatibilidad con los años de la secuencia
              const contentGradeLevels = content.gradeLevels || [];
              const isCompatible = sequenceGradeLevels.length === 0 || 
                                   contentGradeLevels.length === 0 ||
                                   contentGradeLevels.some(gl => sequenceGradeLevels.includes(gl));
              
              // Mostrar un indicador visual para los contenidos compatibles/incompatibles
              return (
                <option key={content.id} value={content.id}>
                  {content.title} ({content.type})
                  {contentGradeLevels.length > 0 && (
                    <span> - [{contentGradeLevels.map(gl => getGradeLevelText(gl)).join(', ')}]</span>
                  )}
                  {!isCompatible && ' ⚠️'}
                </option>
              );
            })}
          </select>
          <button
            onClick={addContent}
            disabled={!selectedContentId || isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            Agregar
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {filteredContents.length} contenidos disponibles
        </p>
      </div>
      
      {/* Lista de contenidos de la secuencia */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-700">Contenidos en la secuencia ({items.length})</h3>
          {items.length > 0 && (
            <button
              onClick={saveOrder}
              disabled={isLoading}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-sm"
            >
              Guardar orden
            </button>
          )}
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">
              No hay contenidos en esta secuencia. Agrega contenidos para comenzar.
            </p>
          </div>
        ) : (
          <DndProvider backend={HTML5Backend}>
            <div>
              {items.map((item, index) => (
                <ContentItem
                  key={item.id}
                  item={item}
                  index={index}
                  moveItem={moveItem}
                  removeItem={removeItem}
                  toggleOptional={toggleOptional}
                  sequenceGradeLevels={sequenceGradeLevels}
                />
              ))}
            </div>
          </DndProvider>
        )}
      </div>
      
      {/* Leyenda y ayuda */}
      <div className="text-sm text-gray-500 mt-4 p-3 bg-blue-50 rounded-md">
        <div className="font-medium text-blue-700 mb-1">Consejos para organizar la secuencia:</div>
        <ul className="list-disc pl-5 space-y-1">
          <li>Arrastra y suelta para reordenar los contenidos</li>
          <li>Marca como "Opcional" los contenidos que no sean obligatorios</li>
          <li>Para una mejor experiencia educativa, trata de mantener contenidos compatibles con los mismos años escolares</li>
          <li>Los contenidos con bordes amarillos indican incompatibilidad de años</li>
          <li>No olvides hacer clic en "Guardar orden" cuando termines de reorganizar</li>
        </ul>
      </div>
    </div>
  );
}