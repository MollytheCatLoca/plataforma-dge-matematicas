// src/components/curriculum/CurriculumTreeView.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { GradeLevel, NodeType } from '@prisma/client'; // Assuming these types are correctly defined
import { ChevronRight, Eye, Edit } from 'lucide-react'; // Using lucide-react for icons

// --- Type Definitions ---

interface Node {
  id: string;
  name: string;
  description?: string | null;
  nodeType: NodeType;
  parentId: string | null;
  gradeLevel?: GradeLevel[];
  // Optional: Pre-calculate children in the data fetching layer if possible
  childrenIds?: string[]; 
}

interface CurriculumTreeViewProps {
  nodes: Node[]; // Flat list of all nodes
  initialExpandedNodeIds?: string[]; // IDs to expand initially
  defaultExpansionLevel?: number; // Alternative: Expand levels initially (e.g., 1 for root, 2 for root + children)
}

// --- Helper Functions ---

// Cache node lookups for performance
const useNodeMap = (nodes: Node[]) => {
  return useMemo(() => {
    const map = new Map<string, Node>();
    const childrenMap = new Map<string | null, string[]>();

    nodes.forEach(node => {
      map.set(node.id, node);
      const parentId = node.parentId ?? null; // Use null for root nodes
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)?.push(node.id);
    });

    // Add pre-calculated childrenIds to each node in the map
    map.forEach(node => {
      node.childrenIds = childrenMap.get(node.id) || [];
    });

    return { nodeMap: map, childrenMap };
  }, [nodes]);
};

// Function to get styling and text based on NodeType
function getNodeTypeInfo(nodeType: NodeType): { text: string; color: string; borderColor: string; hoverColor: string } {
  const nodeTypeMap: Record<NodeType, { text: string; color: string; borderColor: string; hoverColor: string }> = {
    YEAR: { 
      text: 'Año Escolar', 
      color: 'bg-blue-50 dark:bg-blue-900/30', 
      borderColor: 'border-blue-400 dark:border-blue-600',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/50'
    },
    AXIS: { 
      text: 'Eje Temático', 
      color: 'bg-green-50 dark:bg-green-900/30', 
      borderColor: 'border-green-400 dark:border-green-600',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900/50'
    },
    UNIT: { 
      text: 'Unidad', 
      color: 'bg-yellow-50 dark:bg-yellow-900/30', 
      borderColor: 'border-yellow-400 dark:border-yellow-600',
      hoverColor: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/50'
    },
    TOPIC: { 
      text: 'Tema', 
      color: 'bg-purple-50 dark:bg-purple-900/30', 
      borderColor: 'border-purple-400 dark:border-purple-600',
      hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900/50'
    },
    CONCEPT: { 
      text: 'Concepto', 
      color: 'bg-red-50 dark:bg-red-900/30', 
      borderColor: 'border-red-400 dark:border-red-600',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900/50'
    },
    GENERIC: { 
      text: 'Genérico', 
      color: 'bg-gray-50 dark:bg-gray-700/30', 
      borderColor: 'border-gray-400 dark:border-gray-500',
      hoverColor: 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
    }
    // Add other NodeType cases if they exist
  };
  
  return nodeTypeMap[nodeType] || { 
    text: String(nodeType), 
    color: 'bg-gray-50 dark:bg-gray-700/30', 
    borderColor: 'border-gray-400 dark:border-gray-500',
    hoverColor: 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
  };
}

// Function to map GradeLevel enum to readable text
function getGradeLevelText(gradeLevel: GradeLevel): string {
  const gradeLevelMap: Record<GradeLevel, string> = {
    FIRST: '1° Año',
    SECOND: '2° Año',
    THIRD: '3° Año',
    // Add other GradeLevel cases if they exist
  };
  
  return gradeLevelMap[gradeLevel] || String(gradeLevel);
}

// --- NodeItem Component ---

interface NodeItemProps {
  nodeId: string;
  level: number;
  nodeMap: Map<string, Node>;
  expandedNodes: Set<string>;
  toggleNodeExpansion: (nodeId: string) => void;
  isLastChild: boolean;
  parentTreeLines: boolean[]; // Tracks if parent lines are needed
}

const NodeItem: React.FC<NodeItemProps> = React.memo(({ 
  nodeId, 
  level, 
  nodeMap, 
  expandedNodes,
  toggleNodeExpansion,
  isLastChild,
  parentTreeLines
}) => {
  const node = nodeMap.get(nodeId);

  // Return null or a placeholder if node is not found (shouldn't happen ideally)
  if (!node) {
    console.warn(`Node with ID ${nodeId} not found in nodeMap.`);
    return null; 
  }

  const isExpanded = expandedNodes.has(node.id);
  const childNodeIds = node.childrenIds || [];
  const hasChildren = childNodeIds.length > 0;
  
  const { text: nodeTypeText, color, borderColor, hoverColor } = getNodeTypeInfo(node.nodeType);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling if needed
    toggleNodeExpansion(node.id);
  };

  // Calculate tree lines for the current level
  const currentTreeLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < level; i++) {
      // If the parent at this level is not the last child, draw a vertical line
      lines.push(parentTreeLines[i] ? <div key={`line-${i}`} className="absolute top-0 bottom-0 left-[calc(1.5rem*${i}+0.75rem)] w-px bg-gray-300 dark:bg-gray-600"></div> : null);
    }
    return lines.filter(Boolean); // Remove nulls
  }, [level, parentTreeLines]);
  
  return (
    <div className="relative group/nodeitem">
      {/* Vertical connecting lines from ancestors */}
      {currentTreeLines}

      {/* Horizontal and vertical line for this node */}
      {level > 0 && (
        <>
          {/* Horizontal line */}
          <div className="absolute top-[1.375rem] left-[calc(1.5rem*(var(--level)-1)+0.75rem)] w-[0.75rem] h-px bg-gray-300 dark:bg-gray-600" style={{ '--level': level } as React.CSSProperties}></div>
          {/* Vertical line stub (up to the middle of the node) */}
          {!isLastChild && (
            <div className="absolute top-[1.375rem] bottom-0 left-[calc(1.5rem*(var(--level)-1)+0.75rem)] w-px bg-gray-300 dark:bg-gray-600" style={{ '--level': level } as React.CSSProperties}></div>
          )}
        </>
      )}

      <div 
        className={`relative flex items-start space-x-2 py-1`}
        style={{ paddingLeft: `${level * 1.5}rem` }} // Indentation using padding
      >
        {/* Expand/Collapse Button & Node Content Container */}
        <div className={`flex-grow p-2.5 rounded-md border-l-4 ${borderColor} border ${color} ${hoverColor} transition-all duration-150 ease-in-out shadow-sm dark:border-opacity-80 dark:text-gray-200`}>
          <div className="flex items-center justify-between gap-2">
            {/* Left side: Toggle + Name + Type */}
            <div className="flex items-center gap-1 flex-grow min-w-0">
              {/* Toggle Button */}
              <button
                onClick={handleToggle}
                className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150 ${!hasChildren ? 'invisible' : ''}`} // Hide if no children
                aria-label={isExpanded ? "Colapsar" : "Expandir"}
                aria-expanded={isExpanded}
                disabled={!hasChildren}
              >
                <ChevronRight 
                  className={`w-4 h-4 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} 
                />
              </button>
              
              {/* Node Name */}
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate" title={node.name}>
                {node.name}
              </span>
              
              {/* Node Type Badge */}
              <span className="ml-1.5 text-xs px-2 py-0.5 bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 rounded-full flex-shrink-0">
                {nodeTypeText}
              </span>
            </div>
            
            {/* Right side: Actions */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Link
                href={`/dashboard/curriculum/${node.id}`} // Adjust link as needed
                className="p-1.5 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
                title="Ver detalles"
                onClick={(e) => e.stopPropagation()} // Prevent node toggle on link click
              >
                <Eye className="w-4 h-4" />
              </Link>
              <Link
                href={`/dashboard/curriculum/${node.id}/editar`} // Adjust link as needed
                className="p-1.5 rounded text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-900/50 transition-colors"
                title="Editar"
                onClick={(e) => e.stopPropagation()} // Prevent node toggle on link click
              >
                <Edit className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Description */}
          {node.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 pl-7"> {/* Aligned with name */}
              {node.description}
            </p>
          )}
          
          {/* Grade Levels */}
          {node.gradeLevel && node.gradeLevel.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-7"> {/* Aligned with name */}
              <span className="text-xs text-gray-500 dark:text-gray-400">Años:</span>
              {node.gradeLevel.map(grade => (
                <span 
                  key={grade}
                  className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full"
                >
                  {getGradeLevelText(grade)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Render Child Nodes Recursively */}
      {hasChildren && (
         // Use CSS for smooth transition
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}`} 
        >
          {childNodeIds.map((childId, index) => (
            <NodeItem 
              key={childId} 
              nodeId={childId} 
              level={level + 1} 
              nodeMap={nodeMap} 
              expandedNodes={expandedNodes}
              toggleNodeExpansion={toggleNodeExpansion}
              isLastChild={index === childNodeIds.length - 1}
              // Pass down whether ancestor lines are needed
              parentTreeLines={[...parentTreeLines, !isLastChild]} 
            />
          ))}
        </div>
      )}
    </div>
  );
});

NodeItem.displayName = 'NodeItem'; // Add display name for React DevTools

// --- Main TreeView Component ---

export default function CurriculumTreeView({ 
  nodes, 
  initialExpandedNodeIds = [],
  defaultExpansionLevel = 0 // Default to no expansion
}: CurriculumTreeViewProps) {
  
  const { nodeMap, childrenMap } = useNodeMap(nodes);
  const rootNodeIds = useMemo(() => childrenMap.get(null) || [], [childrenMap]);

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
     // Initialize based on props
     if (initialExpandedNodeIds.length > 0) {
       return new Set(initialExpandedNodeIds);
     }
     if (defaultExpansionLevel > 0) {
       const initialSet = new Set<string>();
       const expandUpToLevel = (nodeId: string, currentLevel: number) => {
         if (currentLevel > defaultExpansionLevel) return;
         initialSet.add(nodeId);
         const children = childrenMap.get(nodeId) || [];
         children.forEach(childId => expandUpToLevel(childId, currentLevel + 1));
       };
       rootNodeIds.forEach(rootId => expandUpToLevel(rootId, 1));
       return initialSet;
     }
     return new Set<string>(); // Default empty set
  });

  // Recalculate initial state if props change (optional, depends on use case)
  useEffect(() => {
    // This logic might need adjustment based on how you want prop changes to behave
    // For simplicity, we're initializing based on props only on the first render via useState initializer
  }, [initialExpandedNodeIds, defaultExpansionLevel, rootNodeIds, childrenMap]);

  // Toggle node expansion state
  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodes(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
        // Optional: Collapse children recursively if desired (usually not needed with CSS approach)
        // const collapseChildren = (id: string) => {
        //   const children = childrenMap.get(id) || [];
        //   children.forEach(childId => {
        //      newExpanded.delete(childId);
        //      collapseChildren(childId);
        //   });
        // }
        // collapseChildren(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return newExpanded;
    });
  }, []); // No dependencies needed if using functional update

  // Expand all nodes
  const expandAll = useCallback(() => {
    setExpandedNodes(new Set(nodes.map(node => node.id)));
  }, [nodes]);

  // Collapse all nodes (keeps root nodes visible but collapsed)
  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set<string>());
  }, []);

  // Expand only the first level (root nodes)
  const expandFirstLevel = useCallback(() => {
    setExpandedNodes(new Set(rootNodeIds));
  }, [rootNodeIds]);

  // Get all node types present in the data for the legend
  const availableNodeTypes = useMemo(() => {
    const types = new Set<NodeType>();
    nodes.forEach(node => types.add(node.nodeType));
    // Convert set to array and sort if needed, or use NodeType enum order
    return Array.from(types).sort(); // Example sort, adjust as needed
  }, [nodes]);

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      {/* Control Bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={expandAll}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
        >
          Expandir todo
        </button>
        <button
          onClick={collapseAll}
          className="px-3 py-1.5 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-500 dark:hover:bg-gray-600 transition-colors"
        >
          Colapsar todo
        </button>
        <button
          onClick={expandFirstLevel}
          className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600 transition-colors"
        >
          Expandir 1er Nivel
        </button>
      </div>
      
      {/* Legend */}
      <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">Leyenda</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {availableNodeTypes.map(type => {
            const { text, color, borderColor } = getNodeTypeInfo(type);
            return (
              <div key={type} className="flex items-center">
                <div className={`w-3.5 h-3.5 ${color} border ${borderColor} rounded-sm mr-1.5 flex-shrink-0`}></div>
                <span className="text-xs text-gray-600 dark:text-gray-300">{text}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Curriculum Tree */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-600 min-h-[100px]">
        {rootNodeIds.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay nodos curriculares para mostrar.</p>
        ) : (
          <div role="tree"> {/* Basic ARIA role */}
            {rootNodeIds.map((rootNodeId, index) => (
              <NodeItem 
                key={rootNodeId} 
                nodeId={rootNodeId} 
                level={0} 
                nodeMap={nodeMap} 
                expandedNodes={expandedNodes}
                toggleNodeExpansion={toggleNodeExpansion}
                isLastChild={index === rootNodeIds.length - 1}
                parentTreeLines={[]} // Root nodes have no parent lines
                // Pass necessary props down
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Enums (Example Definitions - Replace with your actual Prisma enums) ---
// It's better to import these from your Prisma client or a shared types file

// Example NodeType Enum (adjust as per your schema)
export enum NodeType {
  YEAR = 'YEAR',
  AXIS = 'AXIS',
  UNIT = 'UNIT',
  TOPIC = 'TOPIC',
  CONCEPT = 'CONCEPT',
  GENERIC = 'GENERIC',
}

// Example GradeLevel Enum (adjust as per your schema)
export enum GradeLevel {
  FIRST = 'FIRST',
  SECOND = 'SECOND',
  THIRD = 'THIRD',
}
