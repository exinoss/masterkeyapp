/**
 * Home — MasterKey
 * Landing pública para visitantes sin sesión iniciada.
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandMark from '../components/BrandMark';
import {
  BookOpen,
  Mic,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle,
  MessageSquare
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: 'Práctica de pronunciación',
      description: 'Mejora tu pronunciación con retroalimentación en tiempo real de tu tutor virtual.'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Aprendizaje interactivo',
      description: 'Sesiones personalizadas adaptadas a tu nivel de inglés (A1 a C2).'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Seguimiento de progreso',
      description: 'Estadísticas detalladas para monitorear tu avance en el aprendizaje.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Supervisión docente',
      description: 'Los docentes pueden seguir el progreso de sus estudiantes con reportes completos.'
    }
  ];

  return (
    <div className="min-h-screen bg-mk-ice">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-mk-surface border-b border-mk-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-mk-blue flex items-center justify-center">
                <BrandMark className="w-[18px] h-[18px]" />
              </div>
              <span className="font-display text-lg font-bold text-mk-ink tracking-tight">
                MasterKey
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-mk-muted hover:text-mk-ink transition-colors">
                Características
              </a>
              <a href="#about" className="text-sm font-medium text-mk-muted hover:text-mk-ink transition-colors">
                Acerca de
              </a>
            </nav>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-mk-gold text-mk-ink text-sm font-semibold hover:bg-mk-gold-dark transition-colors"
              >
                Ir al Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-mk-gold text-mk-ink text-sm font-semibold hover:bg-mk-gold-dark transition-colors"
              >
                Ingresar
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-mk-blue-soft text-mk-blue text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4" />
              Tutor virtual de inglés
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-mk-ink leading-tight mb-6">
              Aprende inglés con un tutor{' '}
              <span className="text-mk-blue">que te escucha</span>
            </h1>

            <p className="text-lg text-mk-muted mb-10 leading-relaxed">
              Practica tu pronunciación y mejora tu fluidez en inglés con un
              tutor virtual que te da retroalimentación instantánea y
              personalizada en cada sesión.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-mk-gold text-mk-ink font-semibold hover:bg-mk-gold-dark transition-colors"
              >
                Comenzar ahora
                <ArrowRight className="w-[18px] h-[18px]" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md border border-mk-line bg-mk-surface text-mk-ink font-semibold hover:bg-mk-ice transition-colors"
              >
                Conocer más
              </a>
            </div>
          </div>

          {/* Panel ilustrativo */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="rounded-lg border border-mk-line bg-mk-surface overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-mk-line">
                <div className="w-2 h-2 rounded-full bg-mk-line" />
                <div className="w-2 h-2 rounded-full bg-mk-line" />
                <div className="w-2 h-2 rounded-full bg-mk-line" />
                <span className="ml-2 text-xs text-mk-muted">Sesión de práctica</span>
              </div>
              <div className="p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-md bg-mk-blue-soft text-mk-blue flex items-center justify-center mb-5">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <p className="font-medium text-mk-ink">
                  Conversa en inglés, en voz o por texto
                </p>
                <p className="text-sm text-mk-muted mt-1.5 max-w-sm">
                  Tu tutor responde al instante y corrige tu pronunciación en
                  cada intento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-mk-surface border-y border-mk-line">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-semibold text-mk-ink mb-3">
              Características principales
            </h2>
            <p className="text-mk-muted max-w-xl mx-auto">
              Todo lo que necesitas para mejorar tu inglés de manera efectiva
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-5 rounded-lg border border-mk-line bg-mk-ice"
              >
                <div className="w-11 h-11 rounded-md bg-mk-blue-soft text-mk-blue flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-mk-ink mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-mk-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Acerca de */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold text-mk-ink mb-5">
                ¿Por qué elegir MasterKey?
              </h2>
              <p className="text-mk-muted mb-8 leading-relaxed">
                MasterKey es una academia que usa inteligencia artificial para
                ayudarte a mejorar tu pronunciación en inglés. Tu tutor virtual
                analiza tu voz y te da retroalimentación detallada sobre
                pronunciación, fluidez, entonación y ritmo.
              </p>
              <ul className="space-y-3">
                {[
                  'Retroalimentación instantánea de pronunciación',
                  'Sesiones adaptadas a tu nivel',
                  'Seguimiento de progreso detallado',
                  'Docentes con reportes completos por estudiante'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-mk-blue shrink-0" />
                    <span className="text-mk-ink">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-mk-line bg-mk-blue-soft aspect-square flex items-center justify-center">
              <div className="w-32 h-32 rounded-md bg-mk-blue flex items-center justify-center">
                <BrandMark className="w-16 h-16" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-mk-blue-dark">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-md bg-white/15 flex items-center justify-center">
              <BrandMark className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-white">MasterKey</span>
          </div>
          <p className="text-sm text-white/60">
            © 2026 MasterKey — Academia de Inglés. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
