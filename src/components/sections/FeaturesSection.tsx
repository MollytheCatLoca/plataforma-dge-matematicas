// src/components/sections/FeaturesSection.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Code, Users, Award, Clock, Book, 
  ChevronRight, ArrowRight, Zap, Layers,
  LayoutGrid, Database, Sparkles, FileCode
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Constantes para personalización
const FEATURES = {
  ANIMATION_DURATION: 0.5,
  SECTION_PADDING: "py-28",
  ACCENT_COLORS: "from-cyan-400 via-blue-500 to-indigo-600",
  PRIMARY_COLORS: "from-blue-600 to-indigo-700",
  HOVER_SCALE: 1.03,
  CARD_BG: "bg-gradient-to-br from-slate-900/90 via-blue-950/90 to-indigo-950/90",
  CARD_BORDER: "border-indigo-500/20",
  CARD_HOVER_BORDER: "border-cyan-400/50",
  SECTION_BG: "bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950",
  IMAGE_OVERLAY: "bg-gradient-to-t from-slate-900/90 via-blue-950/70 to-indigo-900/30"
};

// Categorías de características
const featureCategories = [
  {
    id: "learning",
    name: "Aprendizaje Adaptativo",
    description: "Experiencia personalizada",
    iconName: "brain",
    color: "from-blue-400 to-blue-600",
    image: "/images/learning-adaptive4.jpg",
    tagline: "Inteligencia que evoluciona contigo",
    features: [
      {
        name: "Rutas de Aprendizaje Personalizadas",
        description: "Contenido que se adapta automáticamente según el progreso y estilo de aprendizaje de cada estudiante.",
        image: "/images/learning-adaptive.jpg",
        badge: { text: "IA Avanzada", color: "bg-blue-500" },
        features: [
          "Evaluación continua de comprensión",
          "Ajuste automático de dificultad",
          "Recomendaciones personalizadas",
          "Detección de fortalezas y debilidades"
        ]
      },
      {
        name: "Evaluación Inteligente",
        description: "Sistema que analiza patrones de respuesta para identificar conceptos erróneos y sugerir revisiones específicas.",
        image: "/images/learning-adaptive2.jpg",
        badge: { text: "Analítica", color: "bg-indigo-500" },
        features: [
          "Retroalimentación inmediata",
          "Identificación de patrones de error",
          "Evaluación formativa continua",
          "Reportes de progreso detallados"
        ]
      },
      {
        name: "Objetos de Aprendizaje Interactivos",
        description: "Recursos multimedia que responden a las interacciones del estudiante para reforzar conceptos clave.",
        image: "/images/learning-adaptive3.jpg",
        badge: { text: "Interactivo", color: "bg-purple-500" },
        features: [
          "Simulaciones matemáticas",
          "Visualizaciones dinámicas",
          "Ejercicios paso a paso",
          "Ejemplos contextualizados"
        ]
      }
    ]
  },
  {
    id: "tutor",
    name: "Asistente IA",
    description: "Soporte personalizado",
    iconName: "code",
    color: "from-indigo-400 to-indigo-600",
    image: "/api/placeholder/800/600",
    tagline: "Tu tutor personal 24/7",
    features: [
      {
        name: "Tutor Virtual Inteligente",
        description: "Asistente disponible 24/7 que responde preguntas, explica conceptos y guía el proceso de aprendizaje.",
        image: "/api/placeholder/600/400",
        badge: { text: "IA Conversacional", color: "bg-indigo-500" },
        features: [
          "Explicaciones personalizadas",
          "Soporte multimodal (texto y visual)",
          "Adaptación al estilo de aprendizaje",
          "Secuencias de pistas graduales"
        ]
      },
      {
        name: "Resolución Guiada de Problemas",
        description: "Sistema paso a paso que guía al estudiante a través del proceso de resolver problemas complejos.",
        image: "/api/placeholder/600/400",
        badge: { text: "Pedagógico", color: "bg-sky-500" },
        features: [
          "Descomposición de problemas",
          "Múltiples estrategias de solución",
          "Verificación de resultados",
          "Conexión con conceptos fundamentales"
        ]
      },
      {
        name: "Análisis de Errores",
        description: "Identificación precisa de conceptos erróneos y sugerencias específicas para su corrección.",
        image: "/api/placeholder/600/400",
        badge: { text: "Diagnóstico", color: "bg-teal-500" },
        features: [
          "Detección de errores conceptuales",
          "Recomendaciones de repaso",
          "Historia de dificultades",
          "Alertas para instructores"
        ]
      }
    ]
  },
  {
    id: "teacher",
    name: "Herramientas Docentes",
    description: "Analítica educativa",
    iconName: "layers",
    color: "from-purple-400 to-purple-600",
    image: "/api/placeholder/800/600",
    tagline: "Potencia tu enseñanza",
    features: [
      {
        name: "Analítica de Aprendizaje",
        description: "Dashboards detallados que muestran el progreso individual y grupal, identificando áreas de mejora.",
        image: "/api/placeholder/600/400",
        badge: { text: "Analytics", color: "bg-purple-500" },
        features: [
          "Visualizaciones en tiempo real",
          "Comparativas de desempeño",
          "Identificación de brechas conceptuales",
          "Seguimiento de competencias"
        ]
      },
      {
        name: "Generador de Recursos",
        description: "Herramienta para crear y personalizar contenido educativo alineado con objetivos de aprendizaje específicos.",
        image: "/api/placeholder/600/400",
        badge: { text: "Creativo", color: "bg-fuchsia-500" },
        features: [
          "Plantillas pedagógicas",
          "Ejercicios personalizados",
          "Materiales diferenciados",
          "Alineación curricular automática"
        ]
      },
      {
        name: "Planificador Inteligente",
        description: "Asistente para el diseño de planes de clase y secuencias didácticas basadas en datos de desempeño.",
        image: "/api/placeholder/600/400",
        badge: { text: "Planificación", color: "bg-rose-500" },
        features: [
          "Recomendaciones basadas en datos",
          "Secuenciación optimizada",
          "Diferenciación automática",
          "Integración con estándares curriculares"
        ]
      }
    ]
  }
];

// Obtener el componente de icono correcto basado en el identificador
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'brain':
      return <Brain className="w-6 h-6" />;
    case 'code':
      return <Code className="w-6 h-6" />;
    case 'users':
      return <Users className="w-6 h-6" />;
    case 'layers':
      return <Layers className="w-6 h-6" />;
    case 'zap':
      return <Zap className="w-6 h-6" />;
    case 'book':
      return <Book className="w-6 h-6" />;
    default:
      return <Brain className="w-6 h-6" />;
  }
};

const FeaturesSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [animationPlayed, setAnimationPlayed] = useState(false);

  // Nuevo efecto para animación de entrada única
  useEffect(() => {
    if (!animationPlayed) {
      setAnimationPlayed(true);
    }
  }, []);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const slideIn = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const zoomIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  // Nuevas animaciones para efectos más sofisticados
  const glowPulse = {
    initial: { boxShadow: '0 0 0 rgba(99, 102, 241, 0)' },
    animate: { 
      boxShadow: ['0 0 5px rgba(99, 102, 241, 0.2)', '0 0 20px rgba(99, 102, 241, 0.6)', '0 0 5px rgba(99, 102, 241, 0.2)'],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: 'reverse'
      }
    }
  };

  return (
    <section id="features" className={`${FEATURES.SECTION_PADDING} ${FEATURES.SECTION_BG} relative overflow-hidden`}>
      {/* Fondo dinámico basado en la categoría activa */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={`bg-${activeCategory}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          {featureCategories[activeCategory].image && (
            <>
              <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-sm z-0"></div>
              <Image 
                src={featureCategories[activeCategory].image} 
                alt={featureCategories[activeCategory].name}
                fill
                className="object-cover opacity-30 mix-blend-overlay"
                priority
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Elementos adicionales de fondo */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-950 to-transparent z-10" />
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-indigo-950 to-transparent z-10" />
      
      {/* Efectos de luz y patrones */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute right-0 top-1/4 w-1/3 h-1/3 bg-gradient-radial from-blue-500/10 to-transparent rounded-full filter blur-3xl z-10" 
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 2, delay: 0.8 }}
        className="absolute left-0 bottom-1/3 w-1/4 h-1/4 bg-gradient-radial from-indigo-500/10 to-transparent rounded-full filter blur-3xl z-10" 
      />
      
      {/* Patrón de fondo tipo tecnológico */}
      <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5 z-10" />
      
      {/* Partículas flotantes (efecto dots) */}
      <div className="absolute inset-0 overflow-hidden z-10">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.2,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              opacity: [Math.random() * 0.5 + 0.2, Math.random() * 0.5 + 0.2]
            }}
            transition={{ 
              duration: Math.random() * 20 + 20, 
              repeat: Infinity,
              repeatType: 'reverse',
              ease: "linear"
            }}
            className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full"
            style={{
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: FEATURES.ANIMATION_DURATION }}
          variants={fadeUp}
          className="text-center mb-20"
        >
          <div className="inline-block mb-3 px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-sm font-medium bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Características Destacadas</span>
          </div>
          
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
          >
            <span className={`bg-gradient-to-r ${FEATURES.ACCENT_COLORS} bg-clip-text text-transparent`}>
              Tecnología Educativa Avanzada
            </span>
          </motion.h2>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center mb-6"
          >
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500/40"></div>
            <motion.div 
              animate={{ 
                boxShadow: ['0 0 0px rgba(79, 70, 229, 0)', '0 0 15px rgba(79, 70, 229, 0.5)', '0 0 0px rgba(79, 70, 229, 0)'] 
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-1 mx-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded"
            ></motion.div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-indigo-600/40"></div>
          </motion.div>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed"
          >
            Nuestra plataforma integra lo último en <span className="text-cyan-400 font-medium">inteligencia artificial</span> y 
            <span className="text-indigo-400 font-medium"> ciencias del aprendizaje</span> para crear una experiencia educativa personalizada, 
            efectiva y motivadora.
          </motion.p>
        </motion.div>

        {/* Pestañas de categorías */}
        <div className="mb-12">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-6"
          >
            <h3 className="text-xl md:text-2xl font-semibold text-white">
              Categorías de Características
            </h3>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "6rem" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-px w-24 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 my-3"
            ></motion.div>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4"
          >
            {featureCategories.map((category, index) => (
              <motion.button
                key={index}
                variants={zoomIn}
                whileHover={{ scale: FEATURES.HOVER_SCALE, y: -5 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center p-3 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                  activeCategory === index 
                    ? `bg-gradient-to-r ${category.color} text-white border-white/20 shadow-lg` 
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10 hover:border-white/20'
                }`}
                onClick={() => setActiveCategory(index)}
              >
                <div className={`w-10 h-10 rounded-full ${
                  activeCategory === index
                    ? 'bg-white/20' 
                    : 'bg-white/5'
                } flex items-center justify-center mr-3 transition-colors duration-300`}>
                  {getIconComponent(category.iconName)}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-base">{category.name}</h3>
                  <p className="text-xs opacity-80">{category.description}</p>
                  {activeCategory === index && (
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: 40 }}
                      transition={{ duration: 0.3 }}
                      className="h-0.5 w-10 bg-white mt-2 rounded-full"
                    ></motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Descripción de la categoría */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`category-overview-${activeCategory}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Imagen de la categoría */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="w-full lg:w-1/2 aspect-video relative rounded-2xl overflow-hidden border border-white/10 shadow-xl"
                style={{ 
                  boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.15)"
                }}
              >
                {featureCategories[activeCategory].image ? (
                  <Image
                    src={featureCategories[activeCategory].image}
                    alt={featureCategories[activeCategory].name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${featureCategories[activeCategory].color}`}></div>
                )}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`absolute inset-0 ${FEATURES.IMAGE_OVERLAY}`}
                ></motion.div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-2xl font-bold text-white mb-2">{featureCategories[activeCategory].name}</h3>
                  <p className="text-white/80">{featureCategories[activeCategory].description}</p>
                  {featureCategories[activeCategory].tagline && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="mt-4 inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white"
                    >
                      {featureCategories[activeCategory].tagline}
                    </motion.div>
                  )}
                </div>
              </motion.div>
              
              {/* Descripción de la categoría */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="w-full lg:w-1/2 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10"
                style={{ 
                  boxShadow: "0 10px 30px -10px rgba(79, 70, 229, 0.2)"
                }}
              >
                <motion.div 
                  {...glowPulse}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${featureCategories[activeCategory].color} flex items-center justify-center mb-6`}
                >
                  {getIconComponent(featureCategories[activeCategory].iconName)}
                </motion.div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  Sobre {featureCategories[activeCategory].name}
                </h3>
                
                <p className="text-gray-300 mb-6">
                  {activeCategory === 0 && "Nuestro sistema de aprendizaje adaptativo analiza continuamente el progreso de cada estudiante, ajustando el contenido, la dificultad y el enfoque pedagógico para maximizar la comprensión y retención de conceptos matemáticos fundamentales."}
                  {activeCategory === 1 && "El asistente de IA proporciona soporte personalizado a cada estudiante, respondiendo preguntas, ofreciendo explicaciones alternativas y guiando el proceso de resolución de problemas con un enfoque pedagógico basado en la investigación educativa."}
                  {activeCategory === 2 && "Nuestras herramientas para docentes transforman datos complejos en información accionable, permitiendo identificar patrones de aprendizaje, anticipar dificultades y personalizar estrategias de enseñanza basadas en evidencia."}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {activeCategory === 0 && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="flex items-start"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3 mt-1">
                          <Brain className="text-blue-400 w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Personalización profunda</h4>
                          <p className="text-gray-400 text-sm">Adaptación completa al estudiante</p>
                        </div>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="flex items-start"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3 mt-1">
                          <Layers className="text-blue-400 w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Secuenciación inteligente</h4>
                          <p className="text-gray-400 text-sm">Contenido en el momento óptimo</p>
                        </div>
                      </motion.div>
                    </>
                  )}
                  {activeCategory === 1 && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="flex items-start"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center mr-3 mt-1">
                          <Code className="text-indigo-400 w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Soporte 24/7</h4>
                          <p className="text-gray-400 text-sm">Asistencia cuando la necesitas</p>
                        </div>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="flex items-start"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center mr-3 mt-1">
                          <Award className="text-indigo-400 w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Explicaciones adaptadas</h4>
                          <p className="text-gray-400 text-sm">En el estilo que mejor entiendas</p>
                        </div>
                      </motion.div>
                    </>
                  )}
                  {activeCategory === 2 && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="flex items-start"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mr-3 mt-1">
                          <Clock className="text-purple-400 w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Analítica en tiempo real</h4>
                          <p className="text-gray-400 text-sm">Información cuando la necesitas</p>
                        </div>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="flex items-start"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mr-3 mt-1">
                          <Users className="text-purple-400 w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Intervención temprana</h4>
                          <p className="text-gray-400 text-sm">Detección de dificultades</p>
                        </div>
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Cuadrícula de características */}
        <div className="mb-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-8"
          >
            <h3 className="text-xl md:text-2xl font-semibold text-white">
              {featureCategories[activeCategory].name} - Características
            </h3>
            <div className="h-px w-24 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 my-4"></div>
          </motion.div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeIn}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {featureCategories[activeCategory].features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  variants={slideIn}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onHoverStart={() => setHoveredCard(index)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className={`${FEATURES.CARD_BG} rounded-xl overflow-hidden border ${FEATURES.CARD_BORDER} hover:${FEATURES.CARD_HOVER_BORDER} transition-all duration-300 group backdrop-blur-sm shadow-lg`}
                  style={{
                    boxShadow: "0 15px 30px -10px rgba(30, 41, 59, 0.7)"
                  }}
                >
                  {/* Imagen de la característica */}
                  {feature.image && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image 
                        src={feature.image} 
                        alt={feature.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent"></div>
                      
                      {/* Etiqueta de la característica */}
                      {feature.badge && (
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white ${feature.badge.color}`}>
                          {feature.badge.text}
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 w-full p-4">
                        <h3 className="text-xl font-bold text-white drop-shadow-md">{feature.name}</h3>
                      </div>
                    </div>
                  )}
                  
                  {/* Contenido de la característica */}
                  <div className="p-6">
                    {!feature.image && (
                      <div className="flex justify-between items-start mb-5">
                        <h3 className="text-xl font-bold text-white">{feature.name}</h3>
                        
                        {/* Etiqueta si no hay imagen */}
                        {feature.badge && (
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${feature.badge.color}`}>
                            {feature.badge.text}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p className="text-gray-400 mb-6 min-h-[80px]">{feature.description}</p>
                    
                    <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/5">
                      <h4 className="text-white text-sm font-medium mb-3 flex items-center">
                        <span>Características Clave</span>
                        <div className="h-px flex-grow bg-gradient-to-r from-transparent to-white/30 ml-2"></div>
                      </h4>
                      <div className="space-y-3">
                        {feature.features.slice(0, 4).map((featureItem, fidx) => (
                          <motion.div 
                            key={fidx} 
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: fidx * 0.1 + 0.2 }}
                            className="flex items-start"
                          >
                            <ChevronRight className={`mt-1 flex-shrink-0 ${
                              hoveredCard === index ? 'text-white' : 'text-blue-400'
                            } transition-colors duration-300 w-4 h-4`} />
                            <span className="ml-2 text-gray-300 text-sm">{featureItem}</span>
                          </motion.div>
                        ))}
                        {feature.features.length > 4 && (
                          <div className="text-right text-xs text-blue-400">
                            +{feature.features.length - 4} más
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                      <Link 
                        href="/features" 
                        className="inline-flex items-center text-blue-400 group-hover:text-white transition-colors duration-300"
                      >
                        Ver detalles 
                        <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                      
                      {/* Usar color de etiqueta para etiqueta de categoría */}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        feature.badge ? feature.badge.color : `bg-gradient-to-r ${featureCategories[activeCategory].color}`
                      } bg-opacity-20 text-white`}>
                        {featureCategories[activeCategory].name}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <Link 
            href="/features"
            className="relative inline-flex items-center px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:shadow-lg transition-all duration-300 group overflow-hidden"
          >
            {/* Efecto de brillo al hover */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
            
            <span>Ver Todas las Características de {featureCategories[activeCategory].name}</span>
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;