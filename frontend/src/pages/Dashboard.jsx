/**
 * Dashboard — MasterKey
 * Resumen de progreso del usuario al entrar a la app.
 *
 * Absorbe lo que era la pantalla "Estadísticas" (eliminada): mismo caso de
 * uso ("consultar progreso"), un solo lugar en vez de dos pantallas casi
 * idénticas. Los datos de Estudiante vienen de GET /api/estadisticas/, los
 * de Docente/Administrador de GET /api/reportes/estudiantes/.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { estadisticasService, sesionesService, reportesService } from '../services/api';
import {
  MessageSquare,
  Clock,
  TrendingUp,
  Award,
  Play,
  BookOpen,
  Target,
  CheckCircle2,
  Users,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, isEstudiante, isDocente, isAdmin } = useAuth();

  const [cargando, setCargando] = useState(true);
  // Estudiante
  const [estadisticas, setEstadisticas] = useState(null);
  const [sesionesRecientes, setSesionesRecientes] = useState([]);
  // Docente / Administrador
  const [reporteEquipo, setReporteEquipo] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        if (isEstudiante) {
          const [stats, sesiones] = await Promise.all([
            estadisticasService.obtener(),
            sesionesService.listar()
          ]);
          if (!activo) return;
          setEstadisticas(stats);
          setSesionesRecientes(sesiones.slice(0, 3));
        } else if (isDocente || isAdmin) {
          const reportes = await reportesService.estudiantes();
          if (!activo) return;
          setReporteEquipo(reportes);
        }
      } catch {
        // Los estados quedan en null/[]; la UI de abajo ya contempla "sin datos".
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [isEstudiante, isDocente, isAdmin]);

  const formatearFecha = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    });
  };

  // Mismo criterio de color que en Sesiones: éxito / atención / error
  function estiloPuntuacion(valor) {
    if (valor >= 85) return 'text-mk-success';
    if (valor >= 70) return 'text-mk-streak-ink';
    return 'text-mk-error';
  }

  const nivelEstudiante = estadisticas?.estudiante?.nivel_ingles;
  const totalEquipo = reporteEquipo?.total_estudiantes ?? 0;

  const statsEstudiante = estadisticas
    ? [
        {
          label: 'Sesiones completadas',
          value: estadisticas.estadisticas.sesiones_completadas,
          icon: <MessageSquare className="w-5 h-5" />
        },
        {
          label: 'Tiempo de práctica',
          value: `${Math.round(estadisticas.estadisticas.tiempo_total_minutos / 60)}h`,
          icon: <Clock className="w-5 h-5" />
        },
        {
          label: 'Puntuación promedio',
          value: `${Math.round(estadisticas.estadisticas.puntuacion_promedio)}%`,
          icon: <TrendingUp className="w-5 h-5" />
        },
        {
          label: 'Nivel actual',
          value: nivelEstudiante || '—',
          icon: <Award className="w-5 h-5" />
        }
      ]
    : [];

  // Estudiantes que más atención necesitan primero (menor puntuación promedio)
  const equipoOrdenado = reporteEquipo
    ? [...reporteEquipo.reportes].sort((a, b) => a.puntuacion_promedio - b.puntuacion_promedio)
    : [];

  return (
    <div className="max-w-6xl space-y-6 animate-fadeIn">
      {/* Bienvenida */}
      <div className="bg-mk-blue rounded-lg p-6 lg:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold mb-2">
              Hola, {user?.nombre || 'Usuario'}
            </h1>
            <p className="text-white/75">
              {isEstudiante &&
                (estadisticas?.estadisticas.sesiones_completadas
                  ? `Llevas ${estadisticas.estadisticas.sesiones_completadas} sesiones completadas. Sigue practicando.`
                  : 'Todavía no completas una sesión. ¡Empieza tu primera práctica!')}
              {isDocente && `Tienes ${totalEquipo} estudiante${totalEquipo === 1 ? '' : 's'} asignado${totalEquipo === 1 ? '' : 's'}.`}
              {isAdmin && `${totalEquipo} estudiante${totalEquipo === 1 ? '' : 's'} registrado${totalEquipo === 1 ? '' : 's'} en la plataforma.`}
            </p>
          </div>

          {isEstudiante && (
            <Link
              to="/dashboard/sesiones"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-mk-gold text-mk-ink text-sm font-semibold hover:bg-mk-gold-dark transition-colors shrink-0"
            >
              <Play className="w-4 h-4" />
              Nueva sesión
            </Link>
          )}
        </div>
      </div>

      {cargando ? (
        <p className="text-sm text-mk-muted text-center py-10">Cargando…</p>
      ) : (
        <>
          {/* Estadísticas — estudiantes */}
          {isEstudiante && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsEstudiante.map((stat, index) => (
                <div
                  key={index}
                  className="bg-mk-surface rounded-lg p-5 border border-mk-line"
                >
                  <div className="w-10 h-10 rounded-md bg-mk-blue-soft text-mk-blue flex items-center justify-center mb-4">
                    {stat.icon}
                  </div>
                  <p className="font-display text-2xl font-semibold text-mk-ink">
                    {stat.value}
                  </p>
                  <p className="text-sm text-mk-muted mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Sesiones recientes + Objetivos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sesiones / actividad reciente */}
            <div className="bg-mk-surface rounded-lg border border-mk-line overflow-hidden">
              <div className="px-5 py-3 border-b border-mk-line flex items-center justify-between">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mk-muted">
                  {isEstudiante ? 'Sesiones recientes' : 'Estudiantes con menor puntuación'}
                </h2>
                <Link
                  to={isEstudiante ? '/dashboard/sesiones' : '/dashboard/reportes'}
                  className="text-sm font-medium text-mk-blue hover:underline"
                >
                  Ver todas
                </Link>
              </div>

              {isEstudiante ? (
                sesionesRecientes.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-mk-muted text-center">
                    Aún no tienes sesiones registradas.
                  </p>
                ) : (
                  <ul className="divide-y divide-mk-line">
                    {sesionesRecientes.map((sesion) => (
                      <li key={sesion.id}>
                        <div className="flex items-center gap-4 px-5 py-4">
                          <div className="w-10 h-10 rounded-md bg-mk-blue-soft text-mk-blue flex items-center justify-center shrink-0">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-mk-ink truncate">{sesion.titulo}</p>
                            <p className="text-sm text-mk-muted truncate">
                              {sesion.tema_practica} · {sesion.duracion_minutos} min
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p
                              className={`font-semibold tabular-nums ${estiloPuntuacion(
                                sesion.puntuacion_sesion
                              )}`}
                            >
                              {Math.round(sesion.puntuacion_sesion)}%
                            </p>
                            <p className="text-xs text-mk-muted">
                              {formatearFecha(sesion.fecha_inicio)}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              ) : equipoOrdenado.length === 0 ? (
                <p className="px-5 py-8 text-sm text-mk-muted text-center">
                  Todavía no tienes estudiantes asignados.
                </p>
              ) : (
                <ul className="divide-y divide-mk-line">
                  {equipoOrdenado.slice(0, 3).map((estudiante) => (
                    <li key={estudiante.estudiante_id}>
                      <div className="flex items-center gap-4 px-5 py-4">
                        <div className="w-10 h-10 rounded-md bg-mk-blue-soft text-mk-blue flex items-center justify-center shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-mk-ink truncate">
                            {estudiante.nombre_estudiante}
                          </p>
                          <p className="text-sm text-mk-muted truncate">
                            Nivel {estudiante.nivel_actual} · {estudiante.sesiones_totales} sesiones
                          </p>
                        </div>
                        <p
                          className={`font-semibold tabular-nums shrink-0 ${estiloPuntuacion(
                            estudiante.puntuacion_promedio
                          )}`}
                        >
                          {Math.round(estudiante.puntuacion_promedio)}%
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Objetivos / accesos rápidos */}
            <div className="bg-mk-surface rounded-lg border border-mk-line p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mk-muted mb-5">
                {isEstudiante ? 'Objetivos de hoy' : 'Accesos rápidos'}
              </h2>

              {isEstudiante ? (
                // Contenido ilustrativo: no hay modelo de "objetivos diarios"
                // en el backend todavía, se deja como ejemplo de la sección.
                <div className="space-y-3">
                  {[
                    { id: 1, titulo: 'Completar 1 sesión', progreso: 100, completado: true, meta: '1/1' },
                    { id: 2, titulo: 'Practicar 30 minutos', progreso: 75, completado: false, meta: '22/30 min' }
                  ].map((objetivo) => (
                    <div
                      key={objetivo.id}
                      className={`flex items-center gap-3 p-3 rounded-md border ${
                        objetivo.completado ? 'border-mk-success bg-mk-success-bg' : 'border-mk-line'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 shrink-0 rounded-md flex items-center justify-center ${
                          objetivo.completado ? 'bg-mk-surface text-mk-success' : 'bg-mk-blue-soft text-mk-blue'
                        }`}
                      >
                        {objetivo.completado ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Target className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            objetivo.completado ? 'text-mk-success' : 'text-mk-ink'
                          }`}
                        >
                          {objetivo.titulo}
                        </p>
                        <div className="mt-1.5 h-1.5 bg-mk-ice rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              objetivo.completado ? 'bg-mk-success' : 'bg-mk-blue'
                            }`}
                            style={{ width: `${objetivo.progreso}%` }}
                          />
                        </div>
                      </div>
                      <span
                        className={`text-sm font-semibold tabular-nums shrink-0 ${
                          objetivo.completado ? 'text-mk-success' : 'text-mk-muted'
                        }`}
                      >
                        {objetivo.meta}
                      </span>
                    </div>
                  ))}

                  <div className="mt-5 p-4 rounded-md bg-mk-blue-soft">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 shrink-0 rounded-md bg-mk-surface text-mk-blue flex items-center justify-center">
                        <BookOpen className="w-[18px] h-[18px]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-mk-ink mb-0.5">Tip del día</p>
                        <p className="text-sm text-mk-muted">
                          Practica el sonido "th" colocando la lengua entre los dientes.
                          Intenta decir "think" y "this" lentamente.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/dashboard/reportes"
                    className="p-4 rounded-md border border-mk-line hover:border-mk-blue hover:bg-mk-blue-soft transition-colors text-center"
                  >
                    <Users className="w-6 h-6 text-mk-blue mx-auto mb-2" />
                    <p className="text-sm font-medium text-mk-ink">Ver reportes</p>
                    <p className="text-xs text-mk-muted mt-0.5">
                      {totalEquipo} estudiante{totalEquipo === 1 ? '' : 's'}
                    </p>
                  </Link>
                  <Link
                    to="/dashboard/perfil"
                    className="p-4 rounded-md border border-mk-line hover:border-mk-blue hover:bg-mk-blue-soft transition-colors text-center"
                  >
                    <User className="w-6 h-6 text-mk-blue mx-auto mb-2" />
                    <p className="text-sm font-medium text-mk-ink">Mi perfil</p>
                    <p className="text-xs text-mk-muted mt-0.5">Datos de la cuenta</p>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Progreso semanal — solo estudiantes.
              Contenido ilustrativo: no hay modelo de actividad diaria en el
              backend, solo el agregado total por sesión. Queda como ejemplo
              visual hasta que exista ese dato. */}
          {isEstudiante && (
            <div className="bg-mk-surface rounded-lg border border-mk-line p-5">
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mk-muted">
                  Progreso semanal
                </h2>
                <span className="text-[11px] text-mk-muted">(ejemplo)</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia, index) => {
                  const actividad = [3, 2, 4, 1, 3, 0, 2][index];
                  const hoy = index === 6;

                  return (
                    <div key={dia} className="text-center">
                      <p
                        className={`text-xs font-medium mb-2 ${
                          hoy ? 'text-mk-blue' : 'text-mk-muted'
                        }`}
                      >
                        {dia}
                      </p>
                      <div
                        className={`mx-auto w-9 h-9 rounded-md flex items-center justify-center text-sm font-semibold ${
                          actividad === 0
                            ? 'bg-mk-ice text-mk-muted'
                            : actividad >= 3
                              ? 'bg-mk-blue text-white'
                              : 'bg-mk-blue-soft text-mk-blue'
                        } ${hoy ? 'ring-2 ring-mk-gold ring-offset-2' : ''}`}
                      >
                        {actividad > 0 ? actividad : '–'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
