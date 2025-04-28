// src/components/sections/CTASection.tsx
// Componente CTASection.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

// Constantes para personalización fácil
const CTA = {
  ANIMATION_DURATION: 0.7,
  SECTION_PADDING: "py-20",
  ACCENT_COLORS: "from-blue-400 to-indigo-600",
  PRIMARY_COLORS: "from-blue-500 to-indigo-600",
  HOVER_SCALE: 1.03,
  BORDER_RADIUS: "lg",
  GLOW_INTENSITY: "0 0 40px rgba(59, 130, 246, 0.2)",
};

const CTASection: React.FC = () => {
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

  const benefits = [
    "Experiencia de aprendizaje personalizada",
    "Asistente de IA disponible 24/7",
    "Análisis detallado del progreso",
    "Integración con sistemas escolares existentes",
    "Alineación con estándares curriculares",
    "Soporte técnico y capacitación incluidos"
  ];

  return (
    <section className={`${CTA.SECTION_PADDING} relative overflow-hidden`}>
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-800 z-0" />
      
      {/* Elementos de fondo decorativos */}
      <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10 z-10" />
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-radial from-blue-400/20 to-transparent rounded-full filter blur-3xl z-10" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/3 bg-gradient-radial from-indigo-400/20 to-transparent rounded-full filter blur-3xl z-10" />
      
      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: CTA.ANIMATION_DURATION }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Transforma la Experiencia Educativa
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Únete a las instituciones educativas que están revolucionando el aprendizaje con nuestra plataforma adaptativa e inteligente.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              variants={staggerContainer}
              className="lg:col-span-3 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 relative overflow-hidden"
              style={{ boxShadow: CTA.GLOW_INTENSITY }}
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-radial from-blue-400/30 to-transparent rounded-full filter blur-xl" />
              
              <h3 className="text-2xl font-bold text-white mb-6">Beneficios clave</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-start"
                  >
                    <CheckCircle className="w-5 h-5 text-blue-300 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-100">{benefit}</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-blue-100">
                  Más de <span className="font-bold text-white">200 instituciones</span> ya confían en nuestra plataforma para potenciar el aprendizaje.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              variants={fadeInUp}
              className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-xl relative overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-radial from-blue-100/80 to-transparent rounded-full filter blur-xl" />
              
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Solicita una demo</h3>
              <p className="text-gray-600 mb-6">
                Descubre cómo nuestra plataforma puede transformar la experiencia educativa en tu institución.
              </p>
              
              <div className="space-y-4">
                <div>
                  <input 
                    type="text"
                    placeholder="Nombre"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <input 
                    type="email"
                    placeholder="Correo electrónico"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <input 
                    type="text"
                    placeholder="Institución"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: CTA.HOVER_SCALE }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                >
                  <span>Solicitar Demo</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            variants={fadeInUp}
            className="text-center"
          >
            <p className="text-blue-100 mb-6">
              ¿Prefieres hablar directamente con nuestro equipo?
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-white/30 rounded-lg text-white hover:bg-white/10 transition-colors duration-300"
            >
              <span>Contactar a Ventas</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;