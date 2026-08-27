/**
 * Mis Cursos — MasterKey (solo Docente)
 * Crear cursos con un rango de fechas; cada uno recibe un código para que
 * los estudiantes se unan solos (reemplaza la asignación manual del Admin).
 */
import { useState, useEffect, useCallback } from 'react';
import { GraduationCap, Copy, Check } from 'lucide-react';
import { cursosService } from '../services/api';

const INPUT = 'w-full h-10 px-3.5 rounded-md border border-mk-line bg-mk-surface text-sm text-mk-ink placeholder:text-mk-muted focus:border-mk-blue focus:ring-2 focus:ring-mk-blue/15 outline-none transition-colors';
const LABEL = 'block text-sm font-medium text-mk-ink mb-1.5';

export default function MisCursos() {
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ nombre: '', fecha_inicio: '', fecha_fin: '' });
  const [creando, setCreando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [codigoNuevo, setCodigoNuevo] = useState(null);
  const [copiado, setCopiado] = useState(false);

  const cargarCursos = useCallback(async () => {
    try {
      const data = await cursosService.listar();
      setCursos(data);
    } catch {
      setError('No se pudo cargar tus cursos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCursos();
  }, [cargarCursos]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorForm('');
  };

  const crearCurso = async (e) => {
    e.preventDefault();
    setErrorForm('');
    setCreando(true);
    try {
      const nuevo = await cursosService.crear(form);
      setCursos((prev) => [nuevo, ...prev]);
      setCodigoNuevo(nuevo.codigo);
      setCopiado(false);
      setForm({ nombre: '', fecha_inicio: '', fecha_fin: '' });
    } catch (err) {
      const data = err.response?.data;
      setErrorForm(data ? Object.values(data).flat().join(' ') : 'No se pudo crear el curso.');
    } finally {
      setCreando(false);
    }
  };

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(codigoNuevo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el código ya está bien visible en pantalla.
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-2xl font-semibold text-mk-ink">Mis Cursos</h1>
        <p className="mt-1 text-sm text-mk-muted">
          Creá un curso con un rango de fechas y compartí el código con tus estudiantes para que se unan.
        </p>
      </div>

      {codigoNuevo && (
        <div className="bg-mk-blue-soft border border-mk-blue rounded-lg p-5 flex items-center justify-between gap-4 animate-fadeIn">
          <div>
            <p className="text-sm font-medium text-mk-blue">Curso creado — código de acceso</p>
            <p className="font-display text-3xl font-bold tracking-[0.15em] text-mk-ink mt-1">{codigoNuevo}</p>
          </div>
          <button
            onClick={copiarCodigo}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md bg-mk-surface border border-mk-line text-sm font-semibold text-mk-ink hover:bg-mk-ice transition-colors shrink-0"
          >
            {copiado ? <Check className="w-4 h-4 text-mk-success" /> : <Copy className="w-4 h-4" />}
            {copiado ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      )}

      <section className="bg-mk-surface border border-mk-line rounded-lg p-5">
        <h2 className="font-semibold text-mk-ink mb-4">Crear nuevo curso</h2>
        {errorForm && <p className="text-sm text-mk-error mb-3">{errorForm}</p>}
        <form onSubmit={crearCurso} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className={LABEL}>Nombre del curso</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Inglés A1 - Grupo mañana"
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Fecha de inicio</label>
            <input
              type="date"
              name="fecha_inicio"
              value={form.fecha_inicio}
              onChange={handleChange}
              required
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Fecha de fin</label>
            <input
              type="date"
              name="fecha_fin"
              value={form.fecha_fin}
              onChange={handleChange}
              required
              className={INPUT}
            />
          </div>
          <button
            type="submit"
            disabled={creando}
            className="h-10 px-5 rounded-md bg-mk-gold text-mk-ink text-sm font-semibold hover:bg-mk-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creando ? 'Creando…' : 'Crear curso'}
          </button>
        </form>
      </section>

      <section className="bg-mk-surface border border-mk-line rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-mk-line">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mk-muted">
            Tus cursos ({cursos.length})
          </h2>
        </div>
        {cargando ? (
          <p className="px-5 py-8 text-sm text-mk-muted text-center">Cargando…</p>
        ) : error ? (
          <p className="px-5 py-8 text-sm text-mk-error text-center">{error}</p>
        ) : cursos.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <GraduationCap className="w-10 h-10 text-mk-line mx-auto mb-3" />
            <p className="text-sm text-mk-muted">Todavía no creaste ningún curso.</p>
          </div>
        ) : (
          <ul className="divide-y divide-mk-line">
            {cursos.map((c) => (
              <li key={c.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-md bg-mk-blue-soft text-mk-blue flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-mk-ink truncate">{c.nombre}</p>
                    <span
                      className={`shrink-0 px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        c.vencido ? 'bg-mk-error-bg text-mk-error' : 'bg-mk-success-bg text-mk-success'
                      }`}
                    >
                      {c.vencido ? 'Vencido' : 'Vigente'}
                    </span>
                  </div>
                  <p className="text-sm text-mk-muted truncate">
                    {c.fecha_inicio} → {c.fecha_fin} · {c.total_inscritos} inscripto{c.total_inscritos === 1 ? '' : 's'}
                  </p>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-md bg-mk-ice text-sm font-semibold tabular-nums tracking-wider text-mk-ink">
                  {c.codigo}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
