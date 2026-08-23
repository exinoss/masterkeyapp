/**
 * Página Home - Landing page de AVI
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Mic, 
  BarChart3, 
  Users, 
  ArrowRight,
  CheckCircle,
  Globe
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: 'Práctica de Pronunciación',
      description: 'Mejora tu pronunciación con retroalimentación en tiempo real de nuestro agente virtual.'
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Aprendizaje Interactivo',
      description: 'Sesiones personalizadas adaptadas a tu nivel de inglés (A1 a C2).'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Seguimiento de Progreso',
      description: 'Estadísticas detalladas para monitorear tu avance en el aprendizaje.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Supervisión Docente',
      description: 'Los docentes pueden seguir el progreso de sus estudiantes con reportes completos.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#DEEFE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#159A9C] to-[#002333] flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#002333]">
                AVI
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[#002333]/70 hover:text-[#159A9C] transition-colors">
                Características
              </a>
              <a href="#about" className="text-[#002333]/70 hover:text-[#159A9C] transition-colors">
                Acerca de
              </a>
            </nav>

            {/* Auth Button */}
            <div>
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#159A9C] text-white font-medium hover:bg-[#002333] transition-all duration-300 shadow-lg shadow-[#159A9C]/20 hover:shadow-[#002333]/20"
                >
                  Ir al Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#159A9C] text-white font-medium hover:bg-[#002333] transition-all duration-300 shadow-lg shadow-[#159A9C]/20 hover:shadow-[#002333]/20"
                >
                  Ingresar
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DEEFE7] text-[#159A9C] text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4" />
              Agente Virtual Inteligente
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#002333] leading-tight mb-6">
              Aprende Inglés con un{' '}
              <span className="text-[#159A9C]">Avatar 3D</span>{' '}
              Inteligente
            </h1>
            
            <p className="text-lg sm:text-xl text-[#B4BEC9] mb-10 leading-relaxed">
              Practica tu pronunciación y mejora tu fluidez en inglés con nuestro 
              agente virtual que te proporciona retroalimentación instantánea y personalizada.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#159A9C] text-white font-semibold text-lg hover:bg-[#002333] transition-all duration-300 shadow-xl shadow-[#159A9C]/30 hover:shadow-[#002333]/30 hover:-translate-y-1"
              >
                Comenzar Ahora
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#DEEFE7] text-[#002333] font-semibold text-lg hover:bg-[#B4BEC9]/30 transition-all duration-300"
              >
                Conocer más
              </a>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="mt-16 relative">
            <div className="aspect-video max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#DEEFE7] via-[#FFFFFF] to-[#DEEFE7] border border-[#B4BEC9]/30 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#159A9C] to-[#002333] flex items-center justify-center animate-pulse">
                    <Mic className="w-16 h-16 text-white" />
                  </div>
                  <p className="text-[#002333] font-medium text-lg">
                    Avatar 3D Interactivo
                  </p>
                  <p className="text-[#B4BEC9] mt-2">
                    Próximamente: Modelo 3D animado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#DEEFE7]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#002333] mb-4">
              Características Principales
            </h2>
            <p className="text-lg text-[#B4BEC9] max-w-2xl mx-auto">
              Todo lo que necesitas para mejorar tu inglés de manera efectiva
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white border border-[#B4BEC9]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#159A9C] to-[#002333] flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#002333] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#B4BEC9] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#002333] mb-6">
                ¿Por qué elegir AVI?
              </h2>
              <p className="text-lg text-[#B4BEC9] mb-8 leading-relaxed">
                AVI es un sistema innovador que utiliza inteligencia artificial para 
                ayudarte a mejorar tu pronunciación en inglés. Nuestro agente virtual 
                analiza tu voz y te proporciona retroalimentación detallada sobre 
                pronunciación, fluidez, entonación y ritmo.
              </p>
              <ul className="space-y-4">
                {[
                  'Retroalimentación instantánea de pronunciación',
                  'Sesiones adaptadas a tu nivel',
                  'Seguimiento de progreso detallado',
                  'Sin necesidad de servicios en la nube'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#159A9C] flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[#002333]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#159A9C]/10 to-[#002333]/10 border border-[#B4BEC9]/30 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#159A9C] to-[#002333] flex items-center justify-center">
                  <Globe className="w-24 h-24 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-[#002333]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#159A9C] flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">AVI</span>
          </div>
          <p className="text-[#B4BEC9]">
            © 2025 AVI - Agente Virtual Inteligente. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
