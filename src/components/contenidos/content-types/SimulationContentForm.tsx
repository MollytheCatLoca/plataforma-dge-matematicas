'use client';

import { useState, useEffect } from 'react';
import { ContentFormData } from '../ContentForm';

interface SimulationContentFormProps {
  data: ContentFormData;
  onChange: (data: Partial<ContentFormData>) => void;
}

export default function SimulationContentForm({ data, onChange }: SimulationContentFormProps) {
  const [simulationConfig, setSimulationConfig] = useState<any>(data.contentBody || {});
  const [simulationState, setSimulationState] = useState<any>(null);
  const [interactions, setInteractions] = useState(0);

  // Actualizar configuración cuando cambian los datos
  useEffect(() => {
    setSimulationConfig(data.contentBody || {});
  }, [data.contentBody]);

  // Manejar interacción con la simulación
  const handleInteraction = () => {
    setInteractions(prev => prev + 1);
  };

  return (
    <div className="simulation-content">
      <div className="p-4 mb-4 bg-blue-50 rounded-md">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          {simulationConfig.title || "Simulación Interactiva"}
        </h3>
        <p className="text-blue-700">
          {simulationConfig.description || "Interactúa con la simulación para explorar el concepto."}
        </p>
      </div>
      
      {/* Contenedor de simulación */}
      <div 
        className="aspect-video bg-white border border-gray-300 rounded-md p-6 flex flex-col items-center justify-center"
        onClick={handleInteraction}
      >
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-2">
            {simulationConfig.param1 || "Simulación"}
          </h3>
          <p className="text-gray-600">
            {simulationConfig.param2 ? 
              (typeof simulationConfig.param2 === 'string' ? 
                simulationConfig.param2 : 
                JSON.stringify(simulationConfig.param2)
              ) : 
              "Haga clic en los elementos para interactuar con ellos."
            }
          </p>
        </div>
        
        <div className="flex space-x-4 my-4">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleInteraction();
              setSimulationState(prev => ({ ...prev, value: (prev?.value || 0) + 1 }));
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Incrementar
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleInteraction();
              setSimulationState(prev => ({ ...prev, value: (prev?.value || 0) - 1 }));
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Decrementar
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleInteraction();
              setSimulationState({ value: 0 });
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Reiniciar
          </button>
        </div>
        
        <div className="text-4xl font-bold my-4">
          {simulationState?.value || 0}
        </div>
        
        <p className="text-sm text-gray-500 mt-4">
          Interacciones: {interactions}
        </p>
      </div>
      
      {/* Ayuda de la simulación si está disponible */}
      {simulationConfig.helpText && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium mb-2">Ayuda:</h4>
          <p className="text-gray-700">{simulationConfig.helpText}</p>
        </div>
      )}
    </div>
  );
}