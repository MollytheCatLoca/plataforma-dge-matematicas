// src/components/sections/TestimonialsSection.tsx
// TestimoniosSection.tsx
"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import Image from 'next/image';

// Constantes para personalización fácil
const TESTIMONIALS = {
  ANIMATION_DURATION: 0.7,
  SECTION_PADDING: "py-24",
  ACCENT_COLORS: "from-blue-400 to-indigo-600",
  PRIMARY_COLORS: "from-blue-500 to-indigo-600",
  CARD_BG: "bg-white",
  CARD_HOVER_SHADOW: "shadow-xl",
  BORDER_RADIUS: "xl",
  AUTO_PLAY_INTERVAL: 5000, // ms
};

// Array de testimonios
const testimonials = [
  {
    quote: "La plataforma ha transformado por completo mis clases. Ahora puedo dedicar más tiempo a atender las necesidades específicas de cada estudiante en lugar de tareas administrativas repetitivas.",
    author: "María Rodríguez",
    role: "Profesora de Matemáticas",
    institution: "Colegio San Martín",
    image: "/api/placeholder/80/80",
    rating: 5
  },
  {
    quote: "Me encanta cómo la plataforma se adapta a mi ritmo de aprendizaje. El asistente virtual siempre está disponible para responder mis dudas, y las explicaciones son claras y adaptadas a mi estilo de aprendizaje.",
    author: "Carlos González",
    role: "Estudiante",
    institution: "Escuela Técnica N°5",
    image: "/api/placeholder/80/80",
    rating: 5
  },
  {
    quote: "Los informes detallados nos permiten identificar áreas de mejora y tomar decisiones basadas en datos. La implementación fue sencilla y el soporte técnico ha sido excepcional.",
    author: "Laura Martínez",
    role: "Directora Académica",
    institution: "Instituto Educativo Nacional",
    image: "/api/placeholder/80/80",
    rating: 5
  },
  {
    quote: "La integración de la inteligencia artificial en el proceso educativo ha permitido personalizar el aprendizaje de manera que antes era imposible. Los resultados han superado nuestras expectativas.",
    author: "Fernando Álvarez",
    role: "Coordinador de Tecnología Educativa",
    institution: "Grupo Educativo Mendoza",
    image: "/api/placeholder/80/80",
    rating: 4
  },
  {
    quote: "La capacidad de adaptación de la plataforma a diferentes estilos de aprendizaje ha sido clave para mejorar el rendimiento de nuestros alumnos. La analítica educativa nos proporciona información valiosa para la toma de decisiones.",
    author: "Claudia Vázquez",
    role: "Coordinadora Pedagógica",
    institution: "Colegio Bilingüe del Sur",
    image: "/api/placeholder/80/80",
    rating: 5
  }
];

const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Configuración de animaciones
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  };

  // Funciones de navegación
  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  // Renderiza estrellas de calificación
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <section className={`${TESTIMONIALS.SECTION_PADDING} bg-gray-50 relative overflow-hidden`}>
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white to-transparent z-10" />
      <div className="absolute -top-20 right-0 w-96 h-96 bg-gradient-radial from-blue-200/30 to-transparent rounded-full filter blur-3xl" />
      <div className="absolute -bottom-20 left-0 w-96 h-96 bg-gradient-radial from-indigo-200/30 to-transparent rounded-full filter blur-3xl" />
      <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />
      
      <div className="container mx-auto px-4 relative z-20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: TESTIMONIALS.ANIMATION_DURATION }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <div className="inline-block mb-3 px-4 py-1 rounded-full bg-blue-100 backdrop-blur-sm border border-blue-200">
            <span className="text-sm font-medium text-blue-700">Testimonios</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className={`bg-gradient-to-r ${TESTIMONIALS.ACCENT_COLORS} bg-clip-text text-transparent`}>
              Lo que dicen nuestros usuarios
            </span>
          </h2>
          
          <div className="flex items-center justify-center mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500/40"></div>
            <div className="w-16 h-1 mx-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded"></div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-indigo-600/40"></div>
          </div>
          
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
            Descubre cómo nuestra plataforma está transformando la experiencia educativa en instituciones de todo el país.
          </p>
        </motion.div>
        
        <div 
          className="max-w-5xl mx-auto relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Carrusel principal */}
          <motion.div
            key={currentIndex}
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            transition={{ duration: 0.5 }}
            className={`${TESTIMONIALS.CARD_BG} rounded-${TESTIMONIALS.BORDER_RADIUS} shadow-lg hover:${TESTIMONIALS.CARD_HOVER_SHADOW} p-8 md:p-10 relative transition-all duration-300`}
          >
            <div className="absolute -top-5 left-10 w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-600 flex items-center justify-center">
              <Quote className="w-5 h-5 text-white" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <div className="md:col-span-1 flex flex-col items-center md:items-start">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md mb-4">
                  <Image
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].author}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="text-center md:text-left">
                  <h4 className="font-bold text-gray-900">{testimonials[currentIndex].author}</h4>
                  <p className="text-sm text-gray-600">{testimonials[currentIndex].role}</p>
                  <p className="text-xs text-gray-500">{testimonials[currentIndex].institution}</p>
                  <div className="mt-2">
                    {renderStars(testimonials[currentIndex].rating)}
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-3">
                <p className="text-lg md:text-xl text-gray-700 italic leading-relaxed">
                  "{testimonials[currentIndex].quote}"
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Controles de navegación */}
          <div className="flex justify-between mt-8">
            <button 
              onClick={prevTestimonial} 
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:bg-blue-50"
              aria-label="Testimonio anterior"
            >
              <ChevronLeft className="w-6 h-6 text-blue-600" />
            </button>
            
            <div className="flex items-center space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-blue-600 w-6' : 'bg-gray-300 hover:bg-blue-400'
                  }`}
                  aria-label={`Ir al testimonio ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              onClick={nextTestimonial} 
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:bg-blue-50"
              aria-label="Siguiente testimonio"
            >
              <ChevronRight className="w-6 h-6 text-blue-600" />
            </button>
          </div>
          
          {/* Testimonios adicionales en formato de tarjetas más pequeñas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[0, 1, 2].map((offset) => {
              const index = (currentIndex + offset + 1) % testimonials.length;
              return (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: offset * 0.1 }}
                  variants={fadeIn}
                  whileHover={{ y: -5 }}
                  className={`${TESTIMONIALS.CARD_BG} rounded-lg shadow hover:shadow-md p-6 cursor-pointer transition-all duration-300`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                      <Image
                        src={testimonials[index].image}
                        alt={testimonials[index].author}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonials[index].author}</h4>
                      <p className="text-xs text-gray-600">{testimonials[index].role}</p>
                      {renderStars(testimonials[index].rating)}
                    </div>
                  </div>
                  <p className="text-gray-700 line-clamp-3 text-sm">
                    "{testimonials[index].quote}"
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          variants={fadeInUp}
          className="text-center mt-20"
        >
          <p className="font-semibold text-gray-900 mb-4 text-lg">
            Confían en nosotros instituciones educativas de todo el país
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-8 py-6">
            {/* Logos de instituciones (placeholders) */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grayscale hover:grayscale-0 transition-all duration-300">
                <div className="bg-gray-200 rounded-md w-32 h-10 flex items-center justify-center">
                  <span className="text-gray-500 font-medium">Logo {i}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;