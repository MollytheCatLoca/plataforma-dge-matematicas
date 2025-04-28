// src/components/sections/FooterSection.tsx
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';

// Constantes para personalización fácil
const FOOTER = {
  SECTION_BG: "bg-gray-900",
  TEXT_COLOR: "text-gray-300",
  HEADING_COLOR: "text-white",
  LINK_HOVER: "text-blue-400",
  ACCENT_COLOR: "text-blue-400",
  BORDER_COLOR: "border-gray-800",
  FORM_BG: "bg-gray-800/50",
  BUTTON_BG: "bg-blue-500 hover:bg-blue-600",
};

const FooterSection: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`${FOOTER.SECTION_BG} ${FOOTER.TEXT_COLOR} pt-16 pb-8`}>
      <div className="container mx-auto px-4">
        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-gray-800">
          {/* Columna de la marca */}
          <div className="md:col-span-4">
            <div className="mb-6">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-600 rounded-md flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-xl">E+</span>
                </div>
                <span className="font-bold text-2xl text-white">EduPlus</span>
              </div>
              <p className="mt-4 text-gray-400 leading-relaxed">
                Transformando la educación mediante tecnologías adaptativas e inteligencia artificial que personalizan la experiencia de aprendizaje.
              </p>
            </div>
            
            {/* Información de contacto */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white mb-4">Contacto</h3>
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:info@eduplus.edu" className="text-gray-400 hover:text-blue-400 transition">info@eduplus.edu</a>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-blue-400 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Teléfono</p>
                  <a href="tel:+123456789" className="text-gray-400 hover:text-blue-400 transition">+1 (234) 567-890</a>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Dirección</p>
                  <p className="text-gray-400">Av. Educación 123, Ciudad</p>
                </div>
              </div>
            </div>
            
            {/* Redes sociales */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Síguenos</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-400 transition-colors duration-300"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-700 transition-colors duration-300"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gradient-to-tr from-purple-600 to-pink-600 transition-colors duration-300"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-colors duration-300"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Enlaces rápidos */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-6">Plataforma</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="hover:text-blue-400 transition-colors">
                  Características
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-blue-400 transition-colors">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-blue-400 transition-colors">
                  Solicitar Demo
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="hover:text-blue-400 transition-colors">
                  Testimonios
                </Link>
              </li>
              <li>
                <Link href="/technology" className="hover:text-blue-400 transition-colors">
                  Tecnología
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="hover:text-blue-400 transition-colors">
                  Integraciones
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Enlaces de soporte */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-6">Soporte</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="hover:text-blue-400 transition-colors">
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-blue-400 transition-colors">
                  Documentación
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="hover:text-blue-400 transition-colors">
                  Tutoriales
                </Link>
              </li>
              <li>
                <Link href="/webinars" className="hover:text-blue-400 transition-colors">
                  Webinars
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-blue-400 transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-blue-400 transition-colors">
                  Comunidad
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Enlaces de empresa */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-6">Empresa</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="hover:text-blue-400 transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-blue-400 transition-colors">
                  Carreras
                </Link>
              </li>
              <li>
                <Link href="/partners" className="hover:text-blue-400 transition-colors">
                  Partners
                </Link>
              </li>
              <li>
                <Link href="/press" className="hover:text-blue-400 transition-colors">
                  Prensa
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-blue-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Formulario de suscripción */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-6">Boletín Educativo</h3>
            <p className="text-gray-400 mb-4">
              Recibe las últimas novedades sobre educación, tecnología y nuestra plataforma.
            </p>
            <form className="space-y-3">
              <div>
                <input 
                  type="email" 
                  placeholder="Tu email" 
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 transition-colors flex items-center justify-center"
              >
                <span>Suscribirse</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </form>
            <p className="text-gray-500 text-xs mt-3">
              Al suscribirte, aceptas nuestra <Link href="/privacy" className="text-blue-400 hover:underline">Política de Privacidad</Link> y recibirás comunicaciones sobre nuestros servicios.
            </p>
          </div>
        </div>
        
        {/* Información legal */}
        <div className="pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500">
                &copy; {currentYear} EduPlus. Todos los derechos reservados.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center space-x-4">
              <Link href="/terms" className="text-gray-500 hover:text-blue-400 transition-colors">
                Términos de Servicio
              </Link>
              <Link href="/privacy" className="text-gray-500 hover:text-blue-400 transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/cookies" className="text-gray-500 hover:text-blue-400 transition-colors">
                Política de Cookies
              </Link>
              <Link href="/sitemap" className="text-gray-500 hover:text-blue-400 transition-colors">
                Mapa del Sitio
              </Link>
            </div>
          </div>
          
          <div className="mt-6 text-center text-gray-600 text-sm">
            <p>EduPlus es una plataforma de educación adaptativa basada en inteligencia artificial. No afiliada con instituciones educativas gubernamentales.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;