/**
 * Reportes — MasterKey (Docentes/Administradores)
 * Progreso agregado de los estudiantes asignados al docente
 * (o de todos, si es Administrador). Reemplaza a la antigua pantalla
 * "Administrar Grupo": este es el único lugar donde un Docente ve a
 * "sus" estudiantes, con datos reales en vez de un botón sin función.
 */
import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Users } from 'lucide-react';
import { reportesService } from '../services/api';

export default function Reportes() {
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try {
      const data = await reportesService.estudiantes();
      setReporte(data);
    } catch {
      setError('No se pudo cargar el reporte de estudiantes.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const estiloPuntuacion = (valor) => {
    if (valor >= 85) return 'text-mk-success';
    if (valor >= 70) return 'text-mk-streak-ink';
    return 'text-mk-error';
  };

  return (
    <div className="max-w-5xl space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-mk-ink">Reporte Estudiantes</h1>
          <p className="mt-1 text-sm text-mk-muted">Progreso de los estudiantes asignados a ti.</p>
        </div>
        {reporte && (
          <div className="flex items-center gap-2 h-9 px-3 rounded-md bg-mk-blue-soft text-mk-blue text-sm font-semibold shrink-0">
            <Users className="w-4 h-4" />
            {reporte.total_estudiantes} estudiante{reporte.total_estudiantes === 1 ? '' : 's'}
          </div>
        )}
      </div>

      <section className="bg-mk-surface border border-mk-line rounded-lg overflow-hidden">
        {cargando ? (
          <p className="px-5 py-8 text-sm text-mk-muted text-center">Cargando…</p>
        ) : error ? (
          <p className="px-5 py-8 text-sm text-mk-error text-center">{error}</p>
        ) : reporte.reportes.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <BarChart3 className="w-10 h-10 text-mk-line mx-auto mb-3" />
            <p className="text-sm text-mk-muted">
              Todavía no tienes estudiantes asignados. Un administrador puede
              asignártelos desde el panel de administración.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mk-line text-left">
                  <th className="px-5 py-3 font-semibold text-mk-muted text-[11px] uppercase tracking-[0.08em]">
                    Estudiante
                  </th>
                  <th className="px-5 py-3 font-semibold text-mk-muted text-[11px] uppercase tracking-[0.08em]">
                    Nivel
                  </th>
                  <th className="px-5 py-3 font-semibold text-mk-muted text-[11px] uppercase tracking-[0.08em]">
                    Sesiones
                  </th>
                  <th className="px-5 py-3 font-semibold text-mk-muted text-[11px] uppercase tracking-[0.08em]">
                    Tiempo total
                  </th>
                  <th className="px-5 py-3 font-semibold text-mk-muted text-[11px] uppercase tracking-[0.08em]">
                    Puntuación
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mk-line">
                {reporte.reportes.map((estudiante) => (
                  <tr key={estudiante.estudiante_id} className="hover:bg-mk-ice transition-colors">
                    <td className="px-5 py-3.5 font-medium text-mk-ink">
                      {estudiante.nombre_estudiante}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-1.5 py-0.5 rounded border border-mk-line text-[11px] font-semibold text-mk-muted">
                        {estudiante.nivel_actual}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-mk-muted tabular-nums">
                      {estudiante.sesiones_totales}
                    </td>
                    <td className="px-5 py-3.5 text-mk-muted tabular-nums">
                      {estudiante.tiempo_practica_total} min
                    </td>
                    <td
                      className={`px-5 py-3.5 font-semibold tabular-nums ${estiloPuntuacion(
                        estudiante.puntuacion_promedio
                      )}`}
                    >
                      {Math.round(estudiante.puntuacion_promedio)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
