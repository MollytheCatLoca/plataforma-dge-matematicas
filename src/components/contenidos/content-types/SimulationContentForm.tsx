'use client';

import React, { useState, ChangeEvent } from 'react';

// Define props interface
interface SimulationContentFormProps {
  initialData?: { contentBody?: any }; // Adjust 'any' to a more specific type if possible
  onChange: (data: { contentBody?: any }) => void; // Adjust 'any' if possible
}

// Define the component function with explicit types
const SimulationContentForm: React.FC<SimulationContentFormProps> = ({ initialData, onChange }) => {
  // --- State ---
  // Use a more specific type for simulationConfig if possible
  const [simulationConfig, setSimulationConfig] = useState<any>(initialData?.contentBody || {});

  // --- Event Handlers ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newConfig = { ...simulationConfig, [name]: value };
    setSimulationConfig(newConfig);
    onChange({ contentBody: newConfig });
  };

  // --- Return JSX ---
  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="text-lg font-medium text-gray-700">Simulación Interactiva</h3>
        <p className="text-sm text-gray-500">
          Configure los parámetros específicos para la simulación interactiva.
        </p>
      </div>

      {/* Example: Add form fields for simulation parameters */}
      <div>
        <label htmlFor="simulationParam1" className="block text-sm font-medium text-gray-700">
          Parámetro de Simulación 1
        </label>
        <input
          type="text"
          id="simulationParam1"
          name="param1" // Make sure name matches the key in simulationConfig
          value={simulationConfig.param1 || ''}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Valor del parámetro 1"
        />
      </div>

      <div>
        <label htmlFor="simulationParam2" className="block text-sm font-medium text-gray-700">
          Parámetro de Simulación 2 (JSON)
        </label>
        <textarea
          id="simulationParam2"
          name="param2" // Make sure name matches the key in simulationConfig
          value={typeof simulationConfig.param2 === 'string' ? simulationConfig.param2 : JSON.stringify(simulationConfig.param2 || {}, null, 2)}
          onChange={handleInputChange} // You might need a specific handler for JSON
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder='{ "key": "value" }'
        />
        {/* Add validation/error display for JSON if needed */}
      </div>

      {/* Add more fields as required for your simulation configuration */}
    </div>
  );
};

export default SimulationContentForm;