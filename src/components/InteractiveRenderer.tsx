'use client';

import React, { useEffect, useRef, useState } from 'react';
import MathRenderer from './MathRenderer';

interface InteractiveRendererProps {
  config: any; // El JSON de configuración para la simulación
}

// Componente para gráficas interactivas de funciones
const FunctionGrapher = ({ config }: { config: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentX, setCurrentX] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState<number | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Dimensiones del canvas
    const width = canvas.width;
    const height = canvas.height;
    
    // Rango de valores para el eje X e Y
    const xMin = config.xMin || -10;
    const xMax = config.xMax || 10;
    const yMin = config.yMin || -10;
    const yMax = config.yMax || 10;
    
    // Función para convertir coordenadas matemáticas a coordenadas de canvas
    const mapX = (x: number) => (x - xMin) * width / (xMax - xMin);
    const mapY = (y: number) => height - (y - yMin) * height / (yMax - yMin);
    
    // Función para interpretar la función matemática
    const evaluateFunction = (x: number): number => {
      try {
        // Usar Function para evaluar la expresión matemática
        // Nota: En producción, sería mejor usar una biblioteca de evaluación segura
        const fn = new Function('x', `return ${config.function}`);
        return fn(x);
      } catch (error) {
        console.error('Error evaluando función:', error);
        return 0;
      }
    };
    
    // Limpiar el canvas
    ctx.clearRect(0, 0, width, height);
    
    // Dibujar los ejes
    ctx.beginPath();
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    
    // Eje X
    ctx.moveTo(0, mapY(0));
    ctx.lineTo(width, mapY(0));
    
    // Eje Y
    ctx.moveTo(mapX(0), 0);
    ctx.lineTo(mapX(0), height);
    
    ctx.stroke();
    
    // Dibujar marcas en los ejes
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '10px Arial';
    ctx.fillStyle = '#666';
    
    // Marcas eje X
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
      if (x === 0) continue; // Saltamos el origen
      const xPos = mapX(x);
      ctx.beginPath();
      ctx.moveTo(xPos, mapY(0) - 5);
      ctx.lineTo(xPos, mapY(0) + 5);
      ctx.stroke();
      ctx.fillText(x.toString(), xPos, mapY(0) + 15);
    }
    
    // Marcas eje Y
    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
      if (y === 0) continue; // Saltamos el origen
      const yPos = mapY(y);
      ctx.beginPath();
      ctx.moveTo(mapX(0) - 5, yPos);
      ctx.lineTo(mapX(0) + 5, yPos);
      ctx.stroke();
      ctx.fillText(y.toString(), mapX(0) - 15, yPos);
    }
    
    // Dibujar la función
    ctx.beginPath();
    ctx.strokeStyle = config.color || '#ff0000';
    ctx.lineWidth = 2;
    
    const step = (xMax - xMin) / width;
    let isFirstPoint = true;
    
    for (let x = xMin; x <= xMax; x += step) {
      const y = evaluateFunction(x);
      
      // Evitar puntos fuera del rango
      if (y < yMin || y > yMax) {
        isFirstPoint = true;
        continue;
      }
      
      const canvasX = mapX(x);
      const canvasY = mapY(y);
      
      if (isFirstPoint) {
        ctx.moveTo(canvasX, canvasY);
        isFirstPoint = false;
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }
    
    ctx.stroke();
    
    // Función para manejar el movimiento del mouse
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Convertir coordenadas de canvas a coordenadas matemáticas
      const x = xMin + (mouseX / width) * (xMax - xMin);
      const y = yMax - (mouseY / height) * (yMax - yMin);
      
      setCurrentX(parseFloat(x.toFixed(2)));
      setCurrentY(parseFloat(evaluateFunction(x).toFixed(2)));
    };
    
    // Agregar event listener para el movimiento del mouse
    canvas.addEventListener('mousemove', handleMouseMove);
    
    // Cleanup
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [config]);
  
  return (
    <div className="relative">
      <div className="mb-2">
        <MathRenderer text={config.title || 'Gráfica interactiva'} />
        {config.description && (
          <p className="text-sm text-gray-600 mt-1 mb-3">
            <MathRenderer text={config.description} />
          </p>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={config.width || 500}
        height={config.height || 300}
        className="border border-gray-300 bg-white rounded"
      />
      {currentX !== null && currentY !== null && (
        <div className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 rounded text-sm">
          ({currentX}, {currentY})
        </div>
      )}
    </div>
  );
};

// Componente para geometría interactiva
const GeometryExplorer = ({ config }: { config: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState(false);
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [points, setPoints] = useState(config.points || [
    { x: 100, y: 100 },
    { x: 200, y: 100 },
    { x: 150, y: 50 }
  ]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar polígono conectando los puntos
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = config.fillColor || 'rgba(173, 216, 230, 0.5)';
    ctx.strokeStyle = config.strokeColor || '#1E90FF';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    
    // Dibujar los puntos que se pueden arrastrar
    points.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = index === activePoint ? '#FF4500' : '#3498db';
      ctx.fill();
    });
    
    // Dibujar etiquetas de vértices
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    points.forEach((point, index) => {
      const label = String.fromCharCode(65 + index); // A, B, C, ...
      ctx.fillText(label, point.x, point.y - 20);
    });
    
    // Calcular y mostrar propiedades
    if (config.showProperties && points.length >= 3) {
      // Calcular el área del polígono
      let area = 0;
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
      }
      area = Math.abs(area) / 2;
      
      // Mostrar propiedades
      ctx.font = '12px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'left';
      ctx.fillText(`Área: ${area.toFixed(2)} unidades cuadradas`, 10, 20);
    }
    
    // Función para verificar si un punto está cerca de una posición
    const isPointNear = (x: number, y: number, px: number, py: number, threshold = 15) => {
      return Math.sqrt((x - px) ** 2 + (y - py) ** 2) < threshold;
    };
    
    // Eventos de arrastre
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Verificar si el clic fue sobre un punto
      for (let i = 0; i < points.length; i++) {
        if (isPointNear(x, y, points[i].x, points[i].y)) {
          setDragging(true);
          setActivePoint(i);
          break;
        }
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging || activePoint === null) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Actualizar posición del punto activo
      const newPoints = [...points];
      newPoints[activePoint] = { x, y };
      setPoints(newPoints);
    };
    
    const handleMouseUp = () => {
      setDragging(false);
    };
    
    // Agregar event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    
    // Cleanup
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [points, activePoint, dragging, config]);
  
  return (
    <div>
      <div className="mb-3">
        <h3 className="font-semibold mb-1">{config.title || 'Explorador de Geometría'}</h3>
        <p className="text-sm text-gray-600">{config.description || 'Arrastra los vértices para explorar las propiedades del polígono.'}</p>
      </div>
      <canvas
        ref={canvasRef}
        width={config.width || 400}
        height={config.height || 300}
        className="border border-gray-300 bg-white rounded shadow-sm"
      />
      <div className="mt-2 text-xs text-gray-500">
        Haz clic y arrastra los puntos para modificar la figura.
      </div>
    </div>
  );
};

// Componente para simulación de fracciones
const FractionVisualizer = ({ config }: { config: any }) => {
  const [numerator, setNumerator] = useState(config.initialNumerator || 3);
  const [denominator, setDenominator] = useState(config.initialDenominator || 4);
  
  // Calcular valor decimal
  const decimalValue = numerator / denominator;
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-2">{config.title || 'Visualizador de Fracciones'}</h3>
      <p className="text-sm text-gray-600 mb-4">{config.description || 'Explora cómo se representa una fracción visualmente.'}</p>
      
      <div className="flex items-center mb-4 space-x-2">
        <input
          type="number"
          min="1"
          max="20"
          value={numerator}
          onChange={(e) => setNumerator(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
        />
        <div className="text-2xl font-bold">/</div>
        <input
          type="number"
          min="1"
          max="20"
          value={denominator}
          onChange={(e) => setDenominator(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
        />
        <div className="text-xl ml-4">=</div>
        <div className="text-xl font-semibold">{decimalValue.toFixed(4)}</div>
      </div>
      
      {/* Visualización de la fracción como rectángulos */}
      <div className="relative h-20 bg-gray-100 rounded-lg overflow-hidden mb-4">
        <div 
          className="absolute top-0 left-0 h-full bg-blue-500"
          style={{ width: `${(numerator / denominator) * 100}%` }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full flex">
          {Array.from({ length: denominator }).map((_, i) => (
            <div 
              key={i} 
              className="h-full border-r border-gray-300 last:border-r-0"
              style={{ width: `${100 / denominator}%` }}
            >
              {i < numerator && (
                <div className="h-full w-full flex items-center justify-center text-white text-xs">
                  {i + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Visualización como círculo (representación de pizza) */}
      <div className="relative w-32 h-32 mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="50" fill="#e5e7eb" />
          {Array.from({ length: denominator }).map((_, i) => {
            const startAngle = (i * 360) / denominator;
            const endAngle = ((i + 1) * 360) / denominator;
            
            // Convertir ángulos a coordenadas
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (endAngle - 90) * Math.PI / 180;
            
            const x1 = 50 + 50 * Math.cos(startRad);
            const y1 = 50 + 50 * Math.sin(startRad);
            const x2 = 50 + 50 * Math.cos(endRad);
            const y2 = 50 + 50 * Math.sin(endRad);
            
            // Determinar si este segmento debe estar coloreado
            const isColored = i < numerator;
            
            return (
              <path
                key={i}
                d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                fill={isColored ? '#3b82f6' : 'transparent'}
                stroke="#d1d5db"
                strokeWidth="1"
              />
            );
          })}
        </svg>
      </div>
      
      <div className="text-center mt-4 text-sm text-gray-600">
        {numerator} de {denominator} partes seleccionadas
      </div>
    </div>
  );
};

const InteractiveRenderer: React.FC<InteractiveRendererProps> = ({ config }) => {
  // Parsear la configuración si es un string
  const parsedConfig = typeof config === 'string' ? JSON.parse(config) : config;
  
  // Renderizar el tipo adecuado de simulación basado en el tipo
  switch (parsedConfig.type) {
    case 'function-graph':
      return <FunctionGrapher config={parsedConfig} />;
    case 'geometry':
      return <GeometryExplorer config={parsedConfig} />;
    case 'fraction':
      return <FractionVisualizer config={parsedConfig} />;
    default:
      return (
        <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800">Simulación no reconocida</h3>
          <p className="text-sm text-yellow-700">
            El tipo de simulación "{parsedConfig.type}" no está soportado actualmente.
          </p>
          <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(parsedConfig, null, 2)}
          </pre>
        </div>
      );
  }
};

export default InteractiveRenderer;