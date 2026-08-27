/**
 * Unirme a un Curso — MasterKey (solo Estudiante)
 * El estudiante ingresa el código que le dio su docente. No es
 * obligatorio: se puede seguir practicando inglés sin pertenecer a
 * ningún curso. La única restricción real es no poder estar en dos
 * cursos vigentes a la vez — hay que esperar a que venza el actual.
 */
import { useState, useEffect, useCallback } from 'react';
import { GraduationCap, CheckCircle, AlertCircle } from 'lucide-react';
import { cursosService } from '../services/api';

export default function UnirseCurso() {
  const [inscripcion, setInscripcion] = useState(undefined); // undefined = cargando, null = ninguna
  const [error, setError] = useState('');
  const [codigo, setCodigo] = useState('');
  const [uniendo, setUniendo] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  const cargarMiCurso = useCallback(async () => {
    try {
      const data = await cursosService.miCurso();
      setInscripcion(data.inscripcion);
    } catch {
      setError('No se pudo cargar la información de tu curso.');
      setInscripcion(null);
    }
  }, []);

  useEffect(() => {
    cargarMiCurso();
  }, [cargarMiCurso]);

  const handleUnirse = async (e) => {
    e.preventDefault();
    if (!codigo.trim()) return;
    setError('');
    setUniendo(true);
    try {
      const nueva = await cursosService.unirse(codigo.trim());
      setInscripcion(nueva);
      setMensajeExito(`¡Te uniste a "${nueva.curso.nombre}"!`);
      setCodigo('');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo unir al curso. Revisá el código.');
    } finally {
      setUniendo(false);
    }
  };

  if (inscripcion === undefined) {
    return <p className="text-sm text-mk-muted text-center py-10">Cargando…</p>;
  }

  const cursoVigente = inscripcion && !inscripcion.curso.vencido;

  return (
    <div className="max-w-xl space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-2xl font-semibold text-mk-ink">Mi Curso</h1>
        <p className="mt-1 text-sm text-mk-muted">
          Unirte a un curso es opcional — podés seguir practicando aunque no pertenezcas a ninguno.
        </p>
      </div>

      {mensajeExito && (
        <div className="px-4 py-3 rounded-md bg-mk-success-bg border border-mk-success/30 flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="w-[18px] h-[18px] text-mk-success shrink-0" />
          <p className="text-sm text-mk-success">{mensajeExito}</p>
        </div>
      )}

      {cursoVigente ? (
        <section className="bg-mk-surface border border-mk-line rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-md bg-mk-blue-soft text-mk-blue flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mk-muted">
                Estás inscripto en
              </p>
              <h2 className="font-semibold text-mk-ink">{inscripcion.curso.nombre}</h2>
            </div>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-mk-muted">Docente</dt>
              <dd className="text-mk-ink font-medium">{inscripcion.curso.docente_nombre}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mk-muted">Inicio</dt>
              <dd className="text-mk-ink font-medium">{inscripcion.curso.fecha_inicio}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mk-muted">Termina</dt>
              <dd className="text-mk-ink font-medium">{inscripcion.curso.fecha_fin}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-mk-muted">
            No podés unirte a otro curso hasta que este termine.
          </p>
        </section>
      ) : (
        <section className="bg-mk-surface border border-mk-line rounded-lg p-6">
          {inscripcion && inscripcion.curso.vencido && (
            <div className="mb-4 px-4 py-3 rounded-md bg-mk-streak-bg flex items-center gap-3">
              <AlertCircle className="w-[18px] h-[18px] text-mk-streak-ink shrink-0" />
              <p className="text-sm text-mk-streak-ink">
                Tu curso anterior ("{inscripcion.curso.nombre}") venció el {inscripcion.curso.fecha_fin}. Ya podés unirte a uno nuevo.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 rounded-md bg-mk-error-bg border border-mk-error/30 flex items-center gap-3">
              <AlertCircle className="w-[18px] h-[18px] text-mk-error shrink-0" />
              <p className="text-sm text-mk-error">{error}</p>
            </div>
          )}

          <h2 className="font-semibold text-mk-ink mb-1">Unirme con un código</h2>
          <p className="text-sm text-mk-muted mb-4">Pedile el código a tu docente y escribilo acá.</p>

          <form onSubmit={handleUnirse} className="flex gap-3">
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ej: K7X2QP"
              maxLength={8}
              className="flex-1 h-11 px-3.5 rounded-md border border-mk-line bg-mk-surface text-sm tracking-wider text-mk-ink placeholder:text-mk-muted placeholder:tracking-normal focus:border-mk-blue focus:ring-2 focus:ring-mk-blue/15 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={uniendo || !codigo.trim()}
              className="h-11 px-5 rounded-md bg-mk-gold text-mk-ink text-sm font-semibold hover:bg-mk-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uniendo ? 'Uniendo…' : 'Unirme'}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
