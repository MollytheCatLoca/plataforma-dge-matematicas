// Modificación para src/components/secuencias/EditarSecuenciaClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import CurriculumTreeView from '@/components/curriculum/CurriculumTreeView';

interface EditarSecuenciaClientProps {
  curriculumNodes: any[];
  selectedNodeId?: string;
}

export default function EditarSecuenciaClient({ 
  curriculumNodes, 
  selectedNodeId 
}: EditarSecuenciaClientProps) {
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([]);
  
  // Expandir el nodo seleccionado y sus padres si existe
  useEffect(() => {
    if (selectedNodeId) {
      const expandedIds = [selectedNodeId];
      
      // Buscar todos los padres del nodo seleccionado y expandirlos también
      let currentNode = curriculumNodes.find(node => node.id === selectedNodeId);
      while (currentNode?.parentId) {
        expandedIds.push(currentNode.parentId);
        currentNode = curriculumNodes.find(node => node.id === currentNode.parentId);
      }
      
      setExpandedNodeIds(expandedIds);
    }
  }, [selectedNodeId, curriculumNodes]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-3">Estructura Curricular</h3>
      <p className="text-gray-600 mb-4">
        Visualización del nodo curricular asociado a esta secuencia en su contexto.
        {selectedNodeId && (
          <span className="text-indigo-600 ml-1">
            El nodo seleccionado está resaltado.
          </span>
        )}
      </p>
      
      {curriculumNodes.length === 0 ? (
        <p className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
          No hay nodos curriculares para mostrar.
        </p>
      ) : (
        <CurriculumTreeView 
          nodes={curriculumNodes} 
          initialExpandedNodeIds={expandedNodeIds}
          defaultExpansionLevel={1} 
        />
      )}
    </div>
  );
}