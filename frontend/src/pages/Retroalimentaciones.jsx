/**
 * Retroalimentaciones — MasterKey
 * Historial de sesiones del estudiante; cada una se expande para ver
 * la retroalimentación real que generó el agente en cada interacción.
 */
import { useState, useEffect, useCallback } from 'react';
import { FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { sesionesService, retroalimentacionService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Retroalimentaciones() {
  const { isEstudiante } = useAuth();
  const [sesiones, setSesiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [sesionAbierta, setSesionAbierta] = useState(null);
  const [detalles, setDetalles] = useState({}); // { [sesionId]: retroalimentaciones[] }
  const [cargandoDetalle, setCargandoDetalle] = useState(null);

  const listarSesiones = useCallback(async () => {
    try {
      const data = await sesionesService.listar();
      setSesiones(data);
    } catch {
      setError('No se pudo cargar el historial de sesiones.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    listarSesiones();
  }, [listarSesiones]);

  const alternarSesion = async (sesionId) => {
    if (sesionAbierta === sesionId) {
      setSesionAbierta(null);
      return;
    }
    setSesionAbierta(sesionId);
    if (!detalles[sesionId]) {
      setCargandoDetalle(sesionId);
      try {
        const data = await retroalimentacionService.listar(sesionId);
        setDetalles((prev) => ({ ...prev, [sesionId]: data }));
      } catch {
        setDetalles((prev) => ({ ...prev, [sesionId]: [] }));
      } finally {
        setCargandoDetalle(null);
      }
    }
  };

  const estiloPuntuacion = (valor) => {
    if (valor >= 85) return 'bg-mk-success-bg text-mk-success';
    if (valor >= 70) return 'bg-mk-streak-bg text-mk-streak-ink';
    return 'bg-mk-error-bg text-mk-error';
  };

  return (
    <div className="max-w-5xl space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-2xl font-semibold text-mk-ink">Retroalimentaciones</h1>
        <p className="mt-1 text-sm text-mk-muted">
          {isEstudiante
            ? 'Revisa la retroalimentación que recibiste en cada sesión de práctica.'
            : 'Retroalimentación de las sesiones de tus estudiantes asignados.'}
        </p>
      </div>

      <section className="bg-mk-surface border border-mk-line rounded-lg overflow-hidden">
        {cargando ? (
          <p className="px-5 py-8 text-sm text-mk-muted text-center">Cargando…</p>
        ) : error ? (
          <p className="px-5 py-8 text-sm text-mk-error text-center">{error}</p>
        ) : sesiones.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <FileText className="w-10 h-10 text-mk-line mx-auto mb-3" />
            <p className="text-sm text-mk-muted">
              {isEstudiante
                ? 'Todavía no tienes sesiones con retroalimentación.'
                : 'Tus estudiantes asignados todavía no tienen sesiones registradas.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-mk-line">
            {sesiones.map((sesion) => (
              <li key={sesion.id}>
                <button
                  onClick={() => alternarSesion(sesion.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-mk-ice transition-colors"
                >
                  {sesionAbierta === sesion.id ? (
                    <ChevronDown className="w-4 h-4 shrink-0 text-mk-muted" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0 text-mk-muted" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-mk-ink truncate">{sesion.titulo}</p>
                      {!isEstudiante && sesion.estudiante_nombre && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-mk-blue-soft text-mk-blue text-[11px] font-semibold">
                          {sesion.estudiante_nombre}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-mk-muted truncate">{sesion.tema_practica}</p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-md text-sm font-semibold tabular-nums ${estiloPuntuacion(
                      sesion.puntuacion_sesion
                    )}`}
                  >
                    {Math.round(sesion.puntuacion_sesion)}%
                  </span>
                </button>

                {sesionAbierta === sesion.id && (
                  <div className="px-5 pb-4 animate-fadeIn">
                    {cargandoDetalle === sesion.id ? (
                      <p className="text-sm text-mk-muted py-3">Cargando retroalimentación…</p>
                    ) : !detalles[sesion.id] || detalles[sesion.id].length === 0 ? (
                      <p className="text-sm text-mk-muted py-3">
                        Esta sesión todavía no tiene retroalimentación registrada.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {detalles[sesion.id].map((retro) => (
                          <li
                            key={retro.id}
                            className="rounded-md border border-mk-line bg-mk-ice p-4"
                          >
                            <p className="text-sm text-mk-ink">
                              <span className="font-medium">Dijiste:</span> {retro.texto_original}
                            </p>
                            {retro.texto_esperado && (
                              <p className="text-sm text-mk-muted mt-1">
                                <span className="font-medium">Se esperaba:</span> {retro.texto_esperado}
                              </p>
                            )}
                            {retro.respuesta_agente && (
                              <p className="text-sm text-mk-blue mt-1">{retro.respuesta_agente}</p>
                            )}
                            <p className="mt-2 text-xs font-semibold text-mk-muted tabular-nums">
                              Pronunciación {Math.round(retro.puntuacion_pronunciacion)}% · Fluidez{' '}
                              {Math.round(retro.puntuacion_fluidez)}% · Entonación{' '}
                              {Math.round(retro.puntuacion_entonacion)}%
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
