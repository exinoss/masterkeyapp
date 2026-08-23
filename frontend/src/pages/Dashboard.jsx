/**
 * Página principal del Dashboard
 */
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Award,
  ArrowUpRight,
  Play,
  BookOpen,
  Target,
  Calendar,
  Flame,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, isEstudiante, isDocente, isAdmin } = useAuth();

  // Datos de demostración realistas para estudiantes
  const demoStats = {
    sesiones_completadas: 24,
    horas_practica: 18,
    puntuacion_promedio: 78.5,
    nivel_ingles: user?.perfil?.nivel_ingles || 'B1',
    racha_dias: 7,
    palabras_aprendidas: 342
  };

  // Stats cards para estudiantes
  const studentStats = [
    {
      label: 'Sesiones Completadas',
      value: user?.perfil?.sesiones_completadas || demoStats.sesiones_completadas,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'from-[#159A9C] to-[#002333]',
      change: '+5 esta semana',
      trend: 'up'
    },
    {
      label: 'Horas de Práctica',
      value: `${user?.perfil?.horas_practica || demoStats.horas_practica}h`,
      icon: <Clock className="w-6 h-6" />,
      color: 'from-[#002333] to-[#159A9C]',
      change: '+3.5h esta semana',
      trend: 'up'
    },
    {
      label: 'Puntuación Promedio',
      value: `${user?.perfil?.puntuacion_promedio || demoStats.puntuacion_promedio}%`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-[#159A9C] to-[#DEEFE7]',
      change: '+4.2% vs. anterior',
      trend: 'up'
    },
    {
      label: 'Nivel Actual',
      value: user?.perfil?.nivel_ingles || demoStats.nivel_ingles,
      icon: <Award className="w-6 h-6" />,
      color: 'from-[#002333] to-[#B4BEC9]',
      change: `Próximo: ${getNextLevel(user?.perfil?.nivel_ingles || demoStats.nivel_ingles)}`,
      trend: 'neutral'
    }
  ];

  // Sesiones recientes de demostración
  const sesionesRecientes = [
    {
      id: 1,
      titulo: 'Conversación en restaurante',
      tema: 'Vocabulario de comida',
      fecha: 'Hoy, 10:30 AM',
      puntuacion: 85,
      duracion: '15 min',
      estado: 'completada'
    },
    {
      id: 2,
      titulo: 'Entrevista de trabajo',
      tema: 'Inglés profesional',
      fecha: 'Ayer, 3:45 PM',
      puntuacion: 72,
      duracion: '22 min',
      estado: 'completada'
    },
    {
      id: 3,
      titulo: 'Saludos y presentaciones',
      tema: 'Conversación básica',
      fecha: 'Hace 2 días',
      puntuacion: 91,
      duracion: '12 min',
      estado: 'completada'
    }
  ];

  // Objetivos del día
  const objetivos = [
    { id: 1, titulo: 'Completar 1 sesión', progreso: 100, completado: true, meta: '1/1' },
    { id: 2, titulo: 'Practicar 30 minutos', progreso: 75, completado: false, meta: '22/30 min' },
    { id: 3, titulo: 'Obtener 80% o más', progreso: 100, completado: true, meta: '85%' }
  ];

  function getNextLevel(current) {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const idx = levels.indexOf(current || 'A1');
    return idx < levels.length - 1 ? levels[idx + 1] : 'Maestría';
  }

  function getPuntuacionColor(puntuacion) {
    if (puntuacion >= 85) return 'text-green-500';
    if (puntuacion >= 70) return 'text-[#159A9C]';
    if (puntuacion >= 50) return 'text-yellow-500';
    return 'text-red-500';
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#002333] to-[#159A9C] rounded-2xl p-8 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl md:text-3xl font-bold">
                ¡Hola, {user?.nombre || 'Usuario'}! 👋
              </h1>
              {isEstudiante && (
                <div className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 rounded-full">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-300">{demoStats.racha_dias} días</span>
                </div>
              )}
            </div>
            <p className="text-white/80 text-lg">
              {isEstudiante && 'Continúa tu racha de aprendizaje. ¡Ya llevas 7 días consecutivos!'}
              {isDocente && 'Tienes 3 estudiantes con sesiones pendientes de revisar.'}
              {isAdmin && 'Sistema funcionando correctamente. 15 usuarios activos hoy.'}
            </p>
            {isEstudiante && (
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{demoStats.palabras_aprendidas} palabras aprendidas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white/60" />
                  <span>Miembro desde Nov 2024</span>
                </div>
              </div>
            )}
          </div>
          
          {isEstudiante && (
            <Link
              to="/dashboard/sesiones"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#002333] rounded-xl font-semibold hover:bg-[#DEEFE7] transition-all shadow-lg hover:scale-105"
            >
              <Play className="w-5 h-5" />
              Nueva Sesión
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid - Para Estudiantes */}
      {isEstudiante && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-[#B4BEC9]/20 shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-[#B4BEC9]'}`}>
                  {stat.trend === 'up' && <ArrowUpRight className="w-4 h-4" />}
                </div>
              </div>
              <h3 className="text-3xl font-bold text-[#002333] mb-1">
                {stat.value}
              </h3>
              <p className="text-[#B4BEC9] text-sm mb-2">
                {stat.label}
              </p>
              <p className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-[#159A9C]'}`}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions / Activity */}
        <div className="bg-white rounded-2xl p-6 border border-[#B4BEC9]/20 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#002333]">
              {isEstudiante ? 'Sesiones Recientes' : 'Actividad Reciente'}
            </h2>
            <Link
              to="/dashboard/sesiones"
              className="text-[#159A9C] text-sm font-medium hover:text-[#002333] transition-colors"
            >
              Ver todas →
            </Link>
          </div>

          <div className="space-y-4">
            {sesionesRecientes.map((sesion) => (
              <div
                key={sesion.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#DEEFE7]/30 hover:bg-[#DEEFE7]/50 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#159A9C]/10 flex items-center justify-center group-hover:bg-[#159A9C]/20 transition-colors">
                  <MessageSquare className="w-6 h-6 text-[#159A9C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#002333] truncate">
                    {sesion.titulo}
                  </p>
                  <p className="text-sm text-[#B4BEC9] truncate">
                    {sesion.tema} • {sesion.duracion}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${getPuntuacionColor(sesion.puntuacion)}`}>
                    {sesion.puntuacion}%
                  </p>
                  <p className="text-xs text-[#B4BEC9]">{sesion.fecha}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals / Tips */}
        <div className="bg-white rounded-2xl p-6 border border-[#B4BEC9]/20 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#002333]">
              {isEstudiante ? 'Objetivos de Hoy' : 'Acciones Rápidas'}
            </h2>
            {isEstudiante && (
              <span className="text-sm text-[#159A9C] font-medium">
                2/3 completados
              </span>
            )}
          </div>

          {isEstudiante ? (
            <div className="space-y-4">
              {objetivos.map((objetivo) => (
                <div 
                  key={objetivo.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    objetivo.completado 
                      ? 'border-green-200 bg-green-50/50' 
                      : 'border-[#B4BEC9]/20 hover:border-[#159A9C]/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    objetivo.completado 
                      ? 'bg-green-100' 
                      : 'bg-[#DEEFE7]'
                  }`}>
                    {objetivo.completado ? (
                      <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <Target className="w-6 h-6 text-[#159A9C]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${objetivo.completado ? 'text-green-700' : 'text-[#002333]'}`}>
                      {objetivo.titulo}
                    </p>
                    <div className="mt-2 h-2 bg-[#DEEFE7] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          objetivo.completado ? 'bg-green-500' : 'bg-[#159A9C]'
                        }`}
                        style={{ width: `${objetivo.progreso}%` }}
                      />
                    </div>
                  </div>
                  <span className={`font-semibold ${objetivo.completado ? 'text-green-500' : 'text-[#B4BEC9]'}`}>
                    {objetivo.meta}
                  </span>
                </div>
              ))}
              
              {/* Tip del día */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#159A9C]/10 to-[#002333]/10 border border-[#159A9C]/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#159A9C]/20">
                    <BookOpen className="w-5 h-5 text-[#159A9C]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#002333] mb-1">💡 Tip del día</p>
                    <p className="text-sm text-[#B4BEC9]">
                      Practica el sonido "th" colocando la lengua entre los dientes. 
                      Intenta decir "think" y "this" lentamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/dashboard/reportes"
                className="p-4 rounded-xl border border-[#B4BEC9]/20 hover:border-[#159A9C] hover:bg-[#DEEFE7]/30 transition-all text-center group"
              >
                <TrendingUp className="w-8 h-8 text-[#159A9C] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-[#002333]">Ver Reportes</p>
                <p className="text-xs text-[#B4BEC9] mt-1">12 pendientes</p>
              </Link>
              <Link
                to="/dashboard/grupo-estudiantes"
                className="p-4 rounded-xl border border-[#B4BEC9]/20 hover:border-[#159A9C] hover:bg-[#DEEFE7]/30 transition-all text-center group"
              >
                <MessageSquare className="w-8 h-8 text-[#159A9C] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-[#002333]">Estudiantes</p>
                <p className="text-xs text-[#B4BEC9] mt-1">8 activos</p>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Progreso semanal - Solo estudiantes */}
      {isEstudiante && (
        <div className="bg-white rounded-2xl p-6 border border-[#B4BEC9]/20 shadow-sm">
          <h2 className="text-lg font-semibold text-[#002333] mb-6">
            Progreso Semanal
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia, index) => {
              const actividad = [3, 2, 4, 1, 3, 0, 2][index]; // Datos de demo
              const hoy = index === 6; // Domingo como hoy (ejemplo)
              
              return (
                <div key={dia} className="text-center">
                  <p className={`text-xs font-medium mb-2 ${hoy ? 'text-[#159A9C]' : 'text-[#B4BEC9]'}`}>
                    {dia}
                  </p>
                  <div 
                    className={`mx-auto w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                      actividad === 0 
                        ? 'bg-[#DEEFE7]/50 text-[#B4BEC9]' 
                        : actividad >= 3 
                          ? 'bg-[#159A9C] text-white' 
                          : 'bg-[#159A9C]/30 text-[#002333]'
                    } ${hoy ? 'ring-2 ring-[#159A9C] ring-offset-2' : ''}`}
                  >
                    {actividad > 0 ? actividad : '-'}
                  </div>
                  <p className="text-xs text-[#B4BEC9] mt-1">
                    {actividad > 0 ? `${actividad} ses.` : 'Sin act.'}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#B4BEC9]/20">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#159A9C]" />
                <span className="text-[#B4BEC9]">3+ sesiones</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#159A9C]/30" />
                <span className="text-[#B4BEC9]">1-2 sesiones</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#DEEFE7]" />
                <span className="text-[#B4BEC9]">Sin actividad</span>
              </div>
            </div>
            <p className="text-sm font-medium text-[#002333]">
              Total: <span className="text-[#159A9C]">15 sesiones</span> esta semana
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
