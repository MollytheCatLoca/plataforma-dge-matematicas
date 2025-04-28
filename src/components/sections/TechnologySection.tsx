// src/components/sections/TechnologySection.tsx
"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Database, Server, Monitor, Globe, 
  Lock, ArrowRight, Zap, Cloud, Cpu
} from 'lucide-react';
import Image from 'next/image';

// Constantes para imágenes y personalización fácil
const TECH = {
  // Imágenes
  GRID_PATTERN: "/images/grid-pattern.svg",
  TECH_PATTERN: "/images/tech-pattern.svg",
  FEATURE_IMAGE_1: "/images/hero-background.jpg",
  FEATURE_IMAGE_2: "/images/tech-feature-2.jpg",
  AI_ICON_BG: "/images/ai-icon-bg.svg",
  TECH_DIAGRAM: "/images/tech-diagram.svg",
  
  // Estilos
  ANIMATION_DURATION: 0.7,
  SECTION_PADDING: "py-24",
  ACCENT_COLORS: "from-blue-400 to-indigo-600",
  PRIMARY_COLORS: "from-blue-500 to-indigo-600",
  HOVER_SCALE: 1.03,
  CARD_BG: "bg-white/5",
  CARD_BORDER: "border-white/10",
  CARD_HOVER_BORDER: "border-blue-500/40",
  ICON_SIZE: "w-10 h-10"
};

const TechnologySection: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const technologies = [
    {
      icon: <Brain className={TECH.ICON_SIZE} />,
      title: "Inteligencia Artificial Pedagógica",
      description: "Algoritmos de IA especializados en identificar patrones de aprendizaje y optimizar rutas educativas personalizadas.",
      detailText: "Nuestros modelos de IA están entrenados específicamente para comprender procesos cognitivos relacionados con el aprendizaje matemático."
    },
    {
      icon: <Cpu className={TECH.ICON_SIZE} />,
      title: "Algoritmos Adaptativos",
      description: "Sistemas que ajustan dinámicamente la dificultad, estilo y ritmo de presentación según las necesidades del estudiante.",
      detailText: "Tecnología propietaria que evoluciona con cada interacción, optimizando la experiencia educativa en tiempo real."
    },
    {
      icon: <Server className={TECH.ICON_SIZE} />,
      title: "Arquitectura Modular",
      description: "Plataforma flexible que permite integrar diversas herramientas educativas en un ecosistema cohesivo y personalizable.",
      detailText: "Componentes intercambiables que facilitan la adaptación a diferentes contextos educativos y necesidades curriculares."
    },
    {
      icon: <Monitor className={TECH.ICON_SIZE} />,
      title: "Analítica en Tiempo Real",
      description: "Monitoreo continuo del desempeño para identificar oportunidades de intervención y optimización.",
      detailText: "Dashboards interactivos con métricas relevantes para estudiantes, docentes y administradores educativos."
    },
    {
      icon: <Cloud className={TECH.ICON_SIZE} />,
      title: "Infraestructura Escalable",
      description: "Sistema basado en la nube que se adapta automáticamente a las necesidades de usuarios e instituciones de cualquier tamaño.",
      detailText: "Arquitectura híbrida que combina recursos en la nube y locales para maximizar el rendimiento y la disponibilidad."
    },
    {
      icon: <Lock className={TECH.ICON_SIZE} />,
      title: "Seguridad Integral",
      description: "Protección avanzada de datos educativos con cumplimiento de estándares internacionales de privacidad.",
      detailText: "Encriptación de extremo a extremo y arquitectura de seguridad multicapa que protege la información sensible de estudiantes."
    }
  ];

  const fadeInUp = {
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

  return (
    <section className={`${TECH.SECTION_PADDING} bg-gradient-to-b from-indigo-950 to-blue-950 relative overflow-hidden`}>
      {/* Elementos de fondo */}
      <div className="absolute inset-0">
        {/* Patrón de fondo usando constantes */}
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `url(${TECH.GRID_PATTERN})`, opacity: 0.05 }} />
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-radial from-blue-500/10 to-transparent rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-radial from-indigo-500/10 to-transparent rounded-full filter blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-1/4 h-1/4 bg-gradient-radial from-blue-400/5 to-transparent rounded-full filter blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: TECH.ANIMATION_DURATION }}
          variants={fadeInUp}
          className="text-center mb-20"
        >
          <div className="inline-block mb-3 px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-sm font-medium text-gray-300">Tecnología Educativa</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className={`bg-gradient-to-r ${TECH.ACCENT_COLORS} bg-clip-text text-transparent`}>
              Innovación Tecnológica
            </span>
          </h2>
          
          <div className="flex items-center justify-center mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500/40"></div>
            <div className="w-16 h-1 mx-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded"></div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-indigo-600/40"></div>
          </div>
          
          <p className="text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed">
            Nuestra plataforma integra tecnologías de vanguardia diseñadas específicamente para potenciar el aprendizaje y transformar la experiencia educativa tradicional.
          </p>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: TECH.HOVER_SCALE, y: -5 }}
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
              className={`${TECH.CARD_BG} backdrop-blur-sm rounded-xl p-7 border ${TECH.CARD_BORDER} hover:${TECH.CARD_HOVER_BORDER} transition-all duration-300 group hover:shadow-lg relative overflow-hidden`}
            >
              {/* Patrón de fondo sutil usando constantes */}
              <div className="absolute inset-0" style={{ backgroundImage: `url(${TECH.TECH_PATTERN})`, opacity: 0.05 }} />
              
              {/* Efecto de esquina con degradado */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div
                  className={`w-18 h-18 rounded-lg flex items-center justify-center p-3 mb-5 transition-all duration-300 ${index === 0 ? '' : 'bg-gradient-to-r from-blue-500/20 to-indigo-600/20 group-hover:from-blue-500/30 group-hover:to-indigo-600/30'}`}
                  style={index === 0 ? { backgroundImage: `url(${TECH.AI_ICON_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  <div className="text-blue-400 group-hover:text-white transition-colors duration-300">
                    {tech.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">{tech.title}</h3>
                <div className={`h-0.5 w-12 bg-gradient-to-r ${TECH.PRIMARY_COLORS} rounded mb-4 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                
                <p className="text-gray-400 leading-relaxed">
                  {tech.description}
                </p>
                
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs text-gray-500">Tecnología Educativa</span>
                  <span className="text-blue-400 flex items-center text-sm">
                    <span className="mr-1">Detalles</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Sección destacada con imagen de tecnología */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          variants={fadeInUp}
          className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
        >
          <div className="order-2 lg:order-1">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Tecnología Innovadora que Transforma el Aprendizaje
            </h3>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-400 to-indigo-600 rounded mb-6"></div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Nuestra arquitectura tecnológica está diseñada desde cero para optimizar la experiencia educativa. Combinamos los últimos avances en IA con investigación pedagógica para crear un sistema adaptativo único.
            </p>
            
            <div className="space-y-4 mb-8">
              {[
                "Procesamiento de lenguaje natural especializado en matemáticas",
                "Algoritmos de aprendizaje que identifican patrones cognitivos",
                "Visualización de datos matemáticos complejos en tiempo real",
                "Adaptación dinámica basada en miles de variables de aprendizaje"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-600/20 flex items-center justify-center mr-3 mt-0.5">
                    <ArrowRight className="w-3 h-3 text-blue-400" />
                  </div>
                  <p className="text-gray-300">{feature}</p>
                </div>
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 rounded-lg text-white font-medium inline-flex items-center shadow-lg"
            >
              <span>Descubre Nuestra Tecnología</span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          </div>
          
          <div className="order-1 lg:order-2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              {/* Imagen de la característica usando constantes */}
              <Image 
                src={TECH.FEATURE_IMAGE_1}
                alt="Tecnología educativa avanzada"
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/50 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 p-6">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">IA Pedagógica Avanzada</h4>
                </div>
                <p className="text-gray-300 text-sm max-w-md">
                  Visualización del sistema de inteligencia artificial analizando patrones de aprendizaje en tiempo real.
                </p>
              </div>
            </motion.div>
            
            {/* Elemento decorativo */}
            <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-dashed border-blue-500/20 rounded-xl -z-10"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 border-2 border-dashed border-indigo-500/20 rounded-xl -z-10"></div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          variants={fadeInUp}
          className="mt-20 bg-white/5 backdrop-blur-lg rounded-2xl p-10 border border-white/10 relative overflow-hidden shadow-xl"
        >
          <div className="absolute -top-20 right-0 w-96 h-96 bg-gradient-radial from-blue-500/10 to-transparent rounded-full filter blur-3xl" />
          <div className="absolute -bottom-20 left-0 w-96 h-96 bg-gradient-radial from-indigo-500/5 to-transparent rounded-full filter blur-3xl" />
          
          {/* Diagrama tecnológico de fondo */}
          <div className="absolute inset-0 opacity-10">
            <Image 
              src={TECH.TECH_DIAGRAM}
              alt="Diagrama tecnológico"
              fill
              className="object-cover"
            />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500/20 to-indigo-600/20 flex items-center justify-center mr-4">
                <Cpu className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">Tecnología Educativa de Próxima Generación</h3>
                <div className="h-0.5 w-20 bg-gradient-to-r from-blue-400 to-transparent rounded mt-1"></div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-8 leading-relaxed max-w-4xl">
              Nuestra plataforma está construida con tecnologías de vanguardia que fueron desarrolladas específicamente para el contexto educativo. Integramos los últimos avances en inteligencia artificial, análisis de datos y ciencias del aprendizaje para crear una experiencia educativa que realmente transforma resultados.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Procesamiento de Lenguaje Natural",
                  description: "Comprensión avanzada de consultas matemáticas en lenguaje natural para proporcionar respuestas precisas y pedagógicamente adecuadas.",
                  icon: <Brain className="w-5 h-5" />
                },
                {
                  title: "Sistemas de Recomendación AI",
                  description: "Algoritmos que identifican patrones de aprendizaje y sugieren contenido óptimo basado en necesidades individuales.",
                  icon: <Cpu className="w-5 h-5" />
                },
                {
                  title: "Seguridad de Datos Educativos",
                  description: "Protección integral de la información del estudiante con cumplimiento de normativas educativas internacionales.",
                  icon: <Lock className="w-5 h-5" />
                },
                {
                  title: "Interoperabilidad Educativa",
                  description: "Integración transparente con sistemas de gestión escolar y plataformas de aprendizaje existentes.",
                  icon: <Globe className="w-5 h-5" />
                }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 + (idx * 0.1) }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 p-5 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500/20 to-indigo-600/20 flex items-center justify-center mt-1 mr-4">
                      <div className="text-blue-400">
                        {item.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">{item.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between">
              <span className="text-gray-400 mb-4 md:mb-0">Impulsando el futuro del aprendizaje digital personalizado</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 rounded-lg text-white font-medium inline-flex items-center shadow-md"
              >
                <span>Explora Nuestra Tecnología</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TechnologySection;