"use client";
import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimationControls, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Play, Brain, ChartBar, Shield, Code } from 'lucide-react';

// Constantes para estilos y animaciones con diseño mejorado
const HERO = {
  // Imágenes - Ajustadas para asegurar rutas correctas
  BACKGROUND_IMAGE: "/images/hero-bc1.jpg",
  PLATFORM_DEMO_IMAGE: "/images/hero-background.jpg",
  PATTERN_IMAGE: "/images/tech-pattern.svg",
  GRID_PATTERN: "/images/grid-pattern.svg",
  
  // Estilos
  BG: "bg-gradient-to-b from-slate-950 via-blue-950/80 to-slate-950",
  ANIMATION_DURATION: 0.7,
  PRIMARY_GRADIENT: "from-blue-600 to-indigo-700",
  ACCENT_GRADIENT: "from-cyan-400 via-blue-500 to-indigo-600",
  MUTED_GRADIENT: "from-blue-500/30 to-indigo-600/30",
  GLOW: "0 0 50px rgba(37, 99, 235, 0.5)",
  OVERLAY_BG: "from-black/90 via-blue-950/85 to-slate-950/95",
  PRIMARY_TEXT: "text-slate-100",
  SECONDARY_TEXT: "text-slate-300",
  MUTED_TEXT: "text-slate-400",
  BORDER_ACCENT: "border-indigo-500/20",
  SURFACE_PRIMARY: "bg-slate-900/70",
  SURFACE_SECONDARY: "bg-white/5",
  BLUR_AMOUNT: "backdrop-blur-xl"
};

// Componente de partículas tecnológicas mejorado
const TechParticles: React.FC = () => {
  const controls = useAnimationControls();
  
  useEffect(() => {
    // Iniciar animación después de montaje para mejor rendimiento
    controls.start("animate");
  }, [controls]);

  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={`tech-particle-${i}`}
          className="absolute rounded-full"
          style={{ 
            background: i % 3 === 0 
              ? 'linear-gradient(to right, rgba(96, 165, 250, 0.4), rgba(99, 102, 241, 0.3))' 
              : i % 3 === 1 
                ? 'linear-gradient(to right, rgba(56, 189, 248, 0.3), rgba(96, 165, 250, 0.2))' 
                : 'linear-gradient(to right, rgba(129, 140, 248, 0.3), rgba(79, 70, 229, 0.2))',
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            filter: 'blur(0.5px)'
          }}
          initial={{ 
            x: `${Math.random() * 100}%`, 
            y: `${Math.random() * 100}%`,
            opacity: 0,
            scale: 0
          }}
          variants={{
            animate: {
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              opacity: [Math.random() * 0.4 + 0.1, Math.random() * 0.4 + 0.3, Math.random() * 0.4 + 0.1],
              scale: [Math.random() + 0.3, Math.random() + 0.8, Math.random() + 0.3]
            }
          }}
          animate={controls}
          transition={{ 
            duration: Math.random() * 20 + 15, 
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Componente de red de conexiones mejorado
const ConnectionLines: React.FC = () => {
  const controls = useAnimationControls();
  
  useEffect(() => {
    controls.start("animate");
  }, [controls]);
  
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 z-0 pointer-events-none">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(79, 70, 229, 0.1)" />
            <stop offset="50%" stopColor="rgba(99, 102, 241, 0.2)" />
            <stop offset="100%" stopColor="rgba(79, 70, 229, 0.1)" />
          </linearGradient>
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="url(#grid-gradient)" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
            <stop offset="50%" stopColor="rgba(99, 102, 241, 0.5)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>
      
      {/* Líneas de conexión dinámicas mejoradas */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`connection-${i}`}
          className="absolute"
          style={{ 
            height: `${Math.random() * 1 + 0.5}px`,
            width: `${Math.random() * 25 + 15}%`,
            left: `${Math.random() * 80}%`,
            top: `${Math.random() * 100}%`,
            rotate: `${Math.random() * 360}deg`,
            background: 'url(#line-gradient)',
            backgroundImage: 'linear-gradient(to right, transparent, rgba(99, 102, 241, 0.4), transparent)'
          }}
          initial={{ opacity: 0, width: '5%' }}
          variants={{
            animate: {
              opacity: [0.1, 0.6, 0.1],
              width: [`${Math.random() * 10 + 10}%`, `${Math.random() * 35 + 15}%`, `${Math.random() * 10 + 10}%`],
            }
          }}
          animate={controls}
          transition={{
            duration: Math.random() * 10 + 5,
            repeat: Infinity,
            repeatType: "mirror",
            delay: i * 0.5
          }}
        />
      ))}
    </div>
  );
};

// Componente para efecto de código flotante mejorado
const FloatingCode: React.FC = () => {
  const controls = useAnimationControls();
  
  useEffect(() => {
    controls.start("animate");
  }, [controls]);
  
  const codeLines = [
    "const learning = new AdaptiveLearning();",
    "function calculateProgress(student, topic) {",
    "  return analytics.getInsights();",
    "class AICurriculum extends BaseCurriculum {",
    "const mathEngine = new AdvancedMathEngine();",
    "async function generateExplanation() {",
    "const visualization = plot3D(equation);",
    "export default LearningPathway;",
    "const feedback = ai.analyze(studentResponse);",
    "function renderInteractiveModel() {",
    "import { useState, useEffect } from 'react';",
    "const [progress, setProgress] = useState(0);",
    "useEffect(() => { updateLearningPath(); }, []);",
    "const result = await mathSolver.solve(equation);",
    "visualizeData(studentPerformance);"
  ];

  return (
    <div className="absolute right-0 top-1/4 w-1/3 h-3/5 opacity-20 overflow-hidden z-0 pointer-events-none hidden lg:block">
      {codeLines.map((line, index) => (
        <motion.div
          key={`code-${index}`}
          className="text-xs font-mono whitespace-nowrap"
          style={{
            color: index % 5 === 0 
              ? 'rgba(125, 211, 252, 0.8)' 
              : index % 5 === 1 
                ? 'rgba(167, 139, 250, 0.8)' 
                : index % 5 === 2 
                  ? 'rgba(96, 165, 250, 0.8)'
                  : index % 5 === 3
                    ? 'rgba(129, 140, 248, 0.8)'
                    : 'rgba(56, 189, 248, 0.8)'
          }}
          initial={{ x: "110%", y: index * 25, opacity: 0 }}
          variants={{
            animate: { 
              x: ["-110%"],
              opacity: [0, 0.8, 0]
            }
          }}
          animate={controls}
          transition={{ 
            duration: Math.random() * 35 + 25,
            repeat: Infinity,
            delay: index * 2.5,
            ease: "linear",
            opacity: {
              duration: Math.random() * 35 + 25,
              times: [0, 0.1, 0.9, 1]
            }
          }}
        >
          {line}
        </motion.div>
      ))}
    </div>
  );
};

// Componente principal mejorado
const HeroSection: React.FC = () => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [hoverDemo, setHoverDemo] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  // Efectos de parallax al scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const opacityHeader = useTransform(scrollYProgress, [0, 0.5], [1, 0.6]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Variantes de animación mejoradas
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.25
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 100
      }
    }
  };

  // Para comprobar si hay errores con las imágenes
  console.log("Ruta de imagen de fondo:", HERO.BACKGROUND_IMAGE);
  console.log("Ruta de imagen de demo:", HERO.PLATFORM_DEMO_IMAGE);
  console.log("Ruta de patrón:", HERO.PATTERN_IMAGE);

  return (
    <section 
      id="hero" 
      ref={sectionRef}
      className={`min-h-screen ${HERO.BG} relative overflow-hidden flex items-center py-20`}
    >
      {/* Elementos de fondo con parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y: backgroundY }}
      >
        {/* Gradiente superior */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/40 to-transparent z-10"></div>
        
        {/* Elementos de diseño de fondo */}
        <TechParticles />
        <ConnectionLines />
        <FloatingCode />
        
        {/* Orbes brillantes con efectos mejorados */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.3, 0.6, 0.3],
            scale: [0.8, 1, 1.1, 1]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            repeatType: "mirror" 
          }}
          className="absolute right-1/4 top-1/3 w-[30rem] h-[30rem] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(79, 70, 229, 0.1) 30%, transparent 70%)',
            filter: 'blur(8rem)',
          }}
        ></motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.2, 0.4, 0.2],
            scale: [1, 1.1, 1.2, 1.1]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            repeatType: "mirror", 
            delay: 2 
          }}
          className="absolute left-1/5 bottom-1/4 w-[22rem] h-[22rem] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(99, 102, 241, 0.1) 30%, transparent 70%)',
            filter: 'blur(6rem)',
          }}
        ></motion.div>
        
        {/* Fondo de imagen con overlay mejorado */}
        <div className="absolute inset-0 z-40">
          {/* Imagen de fondo con source desde constantes */}
          <Image
            src={HERO.BACKGROUND_IMAGE}
            alt="Tecnología educativa avanzada"
            fill
            priority
            className="object-cover opacity-15"
            style={{ 
              objectPosition: 'center',
              filter: 'contrast(110%) brightness(40%) saturate(110%)'
            }}
          />
          <div className={`absolute inset-0 bg-gradient-to-b ${HERO.OVERLAY_BG}`}></div>
        </div>
        
        {/* Patrones geométricos sutiles */}
        <div 
          className="absolute inset-0 bg-repeat opacity-5"
          style={{ backgroundImage: `url(${HERO.PATTERN_IMAGE})` }}
        ></div>
        
        {/* Efecto de ruido sutil */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-soft-light z-20 pointer-events-none noise-pattern"></div>
      </motion.div>
      
      <motion.div 
        className="container mx-auto px-4 z-10 relative"
        style={{ y: contentY, opacity: opacityHeader }}
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16"
        >
          {/* Contenido principal */}
          <motion.div 
            variants={itemVariants}
            className="w-full lg:w-1/2 text-center lg:text-left"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="inline-block mb-4 px-5 py-1.5 rounded-full bg-gradient-to-r from-slate-900/90 to-indigo-950/90 backdrop-blur-md border border-white/10"
            >
              <span className="text-sm font-medium bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                Plataforma Educativa de Nueva Generación
              </span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight"
            >
              <span className="text-white drop-shadow-sm">Revolucionando el</span>
              <br />
              <span className={`bg-gradient-to-r ${HERO.ACCENT_GRADIENT} bg-clip-text text-transparent drop-shadow-md`}>
                Aprendizaje de Matemáticas
              </span>
            </motion.h1>
            
            <motion.div 
              variants={itemVariants}
              className="flex justify-center lg:justify-start items-center mb-6"
            >
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-blue-500/70"></div>
              <motion.div 
                animate={{ 
                  boxShadow: ['0 0 0px rgba(56, 189, 248, 0)', '0 0 30px rgba(56, 189, 248, 0.6)', '0 0 0px rgba(56, 189, 248, 0)'],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-1.5 mx-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
              ></motion.div>
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-indigo-500/70"></div>
            </motion.div>
            
            <motion.p 
              variants={itemVariants}
              className={`${HERO.SECONDARY_TEXT} text-lg md:text-xl mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed`}
            >
              Nuestra plataforma combina <span className="text-cyan-300 font-medium">inteligencia artificial</span> con las 
              últimas <span className="text-indigo-300 font-medium">investigaciones pedagógicas</span> para crear experiencias 
              de aprendizaje personalizadas que transforman la educación matemática.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <Link 
                href="/dashboard" 
                className="relative group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur-md opacity-70 group-hover:opacity-100 group-hover:blur-lg transition-all duration-300"></span>
                <span className="relative inline-flex items-center px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg group-hover:translate-y-[-1px] transition-all duration-300 shadow-lg shadow-indigo-500/20">
                  Comenzar Ahora
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
              
              <Link 
                href="#features" 
                className="inline-flex items-center px-7 py-3.5 bg-white/5 backdrop-blur-md border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-black/20 hover:border-white/20"
              >
                Explorar Características
                <ChevronRight className="ml-1 w-5 h-5" />
              </Link>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="mt-10 flex items-center justify-center lg:justify-start text-sm text-gray-400"
            >
              <div className="flex -space-x-3 mr-3">
                {[1, 2, 3, 4].map(i => (
                  <div 
                    key={i} 
                    className="w-9 h-9 rounded-full border-2 border-blue-950 overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg" 
                    aria-hidden="true"
                  >
                    <motion.div 
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                      className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 opacity-30"
                    ></motion.div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                      {i === 1 ? 'A' : i === 2 ? 'B' : i === 3 ? 'C' : '+'}
                    </div>
                  </div>
                ))}
              </div>
              <span>Más de <span className="text-white font-semibold">5,000+</span> estudiantes activos</span>
            </motion.div>
          </motion.div>
          
          {/* Ilustración/Demo mejorada */}
          <motion.div 
            variants={itemVariants}
            className="w-full lg:w-1/2"
          >
            <div className="relative">
              {/* Elemento decorativo flotante 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="absolute -left-6 -top-6 z-20 hidden md:block"
              >
                <div className="bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-xl p-4 shadow-lg shadow-indigo-500/5">
                  <div className="flex items-center">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center mr-3 shadow-inner shadow-black/30"
                    >
                      <Brain className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <h4 className="font-medium text-white text-sm">Aprendizaje Adaptativo</h4>
                      <p className={`${HERO.MUTED_TEXT} text-xs`}>IA que evoluciona contigo</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Elemento decorativo flotante 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="absolute -right-6 bottom-1/4 z-20 hidden md:block"
              >
                <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 rounded-xl p-4 shadow-lg shadow-cyan-500/5">
                  <div className="flex items-center">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mr-3 shadow-inner shadow-black/30"
                    >
                      <ChartBar className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <h4 className="font-medium text-white text-sm">Insights Inteligentes</h4>
                      <p className={`${HERO.MUTED_TEXT} text-xs`}>Analítica educativa avanzada</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Nuevo elemento decorativo flotante 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.7 }}
                className="absolute left-1/4 -bottom-6 z-20 hidden md:block"
              >
                <div className="bg-slate-900/80 backdrop-blur-md border border-blue-500/20 rounded-xl p-4 shadow-lg shadow-blue-500/5">
                  <div className="flex items-center">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-3 shadow-inner shadow-black/30"
                    >
                      <Code className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <h4 className="font-medium text-white text-sm">Ejercicios Interactivos</h4>
                      <p className={`${HERO.MUTED_TEXT} text-xs`}>Aprende haciendo, no memorizando</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Marco principal mejorado */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                onHoverStart={() => setHoverDemo(true)}
                onHoverEnd={() => setHoverDemo(false)}
                className="bg-gradient-to-br from-slate-900/95 via-blue-950/95 to-slate-900/95 backdrop-blur-xl rounded-2xl overflow-hidden border border-indigo-500/20 shadow-2xl transition-all duration-300"
                style={{ 
                  boxShadow: `0 30px 60px -15px rgba(29, 78, 216, ${hoverDemo ? '0.35' : '0.25'})`,
                  transform: hoverDemo ? 'scale(1.01)' : 'scale(1)'
                }}
              >
                {/* Barra de navegación de la demo mejorada */}
                <div className="bg-black/40 border-b border-white/10 px-4 py-3 flex items-center">
                  <div className="flex space-x-1.5 mr-4">
                    <div className="w-3 h-3 rounded-full bg-red-500/90"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/90"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/90"></div>
                  </div>
                  <div className="h-7 flex-grow bg-slate-800/90 rounded-full px-4 py-1.5 text-xs text-slate-400 font-mono truncate">
                    plataforma-dge.matematicas.edu/dashboard
                  </div>
                </div>
                
                {/* Contenido de la demostración mejorado con imagen desde constantes */}
                <div className="relative aspect-video max-h-[420px] overflow-hidden">
                  <Image 
                    src={HERO.PLATFORM_DEMO_IMAGE}
                    alt="Plataforma de matemáticas en acción" 
                    width={1200}
                    height={800}
                    className="w-full h-full object-cover"
                    style={{ 
                      filter: hoverDemo ? 'brightness(1.1) contrast(1.05)' : 'brightness(1) contrast(1)',
                      transition: 'all 0.5s ease'
                    }}
                  />
                  
                  {/* Overlay de la demostración mejorado */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/95 via-slate-900/70 to-transparent flex items-end">
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-white mb-3">Plataforma Interactiva</h3>
                      <p className="text-slate-300 mb-6 max-w-lg">Visualiza y comprende conceptos matemáticos complejos con nuestra tecnología de visualización avanzada y herramientas de aprendizaje personalizado.</p>
                      <motion.button 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 rounded-lg text-white hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
                      >
                        <Play className="w-4 h-4" />
                        <span>Ver demostración</span>
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* Efectos de interfaz mejorados */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 0.4, 0],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      repeatDelay: 2,
                      delay: 2
                    }}
                    className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full blur-3xl"
                    style={{
                      background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(79, 70, 229, 0.2) 40%, transparent 70%)',
                    }}
                  ></motion.div>
                  
                  {/* Marcadores de interfaz para sensación tecnológica */}
                  <div className="absolute top-6 right-6 flex space-x-2">
                    <motion.div 
                      animate={{ opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
                      className="w-2 h-2 rounded-full bg-cyan-400"
                    ></motion.div>
                    <motion.div 
                      animate={{ opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 0.5 }}
                      className="w-2 h-2 rounded-full bg-blue-400"
                    ></motion.div>
                    <motion.div 
                      animate={{ opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror", delay: 1 }}
                      className="w-2 h-2 rounded-full bg-indigo-400"
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
              
              {/* Elementos decorativos mejorados */}
              <div className="absolute inset-0 -z-10 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: animationComplete ? 0.15 : 0, scale: 1 }}
                  transition={{ duration: 1, delay: 1.5 }}
                  className="absolute inset-0 border-2 border-blue-500/15 rounded-2xl -translate-x-5 -translate-y-5"
                ></motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: animationComplete ? 0.2 : 0, scale: 1 }}
                  transition={{ duration: 1, delay: 1.8 }}
                  className="absolute inset-0 border-2 border-indigo-500/15 rounded-2xl translate-x-5 translate-y-5"
                ></motion.div>
                
                {/* Líneas decorativas adicionales */}
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: animationComplete ? 0.3 : 0, width: "30%" }}
                  transition={{ duration: 1.2, delay: 2 }}
                  className="absolute -right-8 top-1/4 h-px bg-gradient-to-r from-transparent to-blue-500/50"
                ></motion.div>
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: animationComplete ? 0.3 : 0, width: "25%" }}
                  transition={{ duration: 1.2, delay: 2.2 }}
                  className="absolute -left-8 bottom-1/3 h-px bg-gradient-to-l from-transparent to-indigo-500/50"
                ></motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Logotipos de clientes/instituciones mejorados */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.8 }}
          className="mt-24 pt-12 border-t border-white/10"
        >
          <p className="text-center text-sm text-slate-500 mb-10 uppercase tracking-widest">Instituciones Educativas y Organizaciones Asociadas</p>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.05, opacity: 0.8 }}
                transition={{ duration: 0.2 }}
                className="h-8 w-32 bg-gradient-to-r from-white/8 to-white/5 rounded-md backdrop-blur-sm flex items-center justify-center border border-white/5 shadow-inner shadow-white/5"
              >
                <div className="h-3 w-2/3 rounded-sm bg-white/20"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
      
      {/* Efecto de superposición para transición suave a la siguiente sección */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent z-20"></div>
      
      {/* Estilos globales para animaciones y efectos especiales */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        
        .noise-pattern {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>
    </section>
  );
};

export default HeroSection;