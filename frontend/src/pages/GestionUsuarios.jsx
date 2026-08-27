/**
 * Gestionar Usuarios — MasterKey (solo Administrador)
 * Aprobar/activar-desactivar cuentas, y asignar Estudiantes a Docentes
 * (única forma de que un Docente vea a sus estudiantes en Reportes y
 * Retroalimentaciones — sin asignación, esas pantallas le quedan vacías).
 */
import { useState, useEffect, useCallback } from 'react';
import { UserCheck, UserX, Link2, X } from 'lucide-react';
import { usuariosService, asignacionesService, docentesService, estudiantesService } from '../services/api';

const rolLabel = { estudiante: 'Estudiante', docente: 'Docente', administrador: 'Administrador' };

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [accionando, setAccionando] = useState(null);

  const [docenteSeleccionado, setDocenteSeleccionado] = useState('');
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState('');
  const [asignando, setAsignando] = useState(false);
  const [errorAsignacion, setErrorAsignacion] = useState('');

  const cargarTodo = useCallback(async () => {
    try {
      const [datosUsuarios, datosAsignaciones, datosDocentes, datosEstudiantes] = await Promise.all([
        usuariosService.listar(),
        asignacionesService.listar(),
        docentesService.listar(),
        estudiantesService.listar(),
      ]);
      setUsuarios(datosUsuarios);
      setAsignaciones(datosAsignaciones);
      setDocentes(datosDocentes);
      setEstudiantes(datosEstudiantes);
    } catch {
      setError('No se pudo cargar la información de usuarios.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  const alternarActivo = async (usuario) => {
    setAccionando(usuario.id);
    try {
      if (usuario.is_active) {
        await usuariosService.desactivar(usuario.id);
      } else {
        await usuariosService.activar(usuario.id);
      }
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuario.id ? { ...u, is_active: !u.is_active } : u))
      );
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo actualizar el usuario.');
    } finally {
      setAccionando(null);
    }
  };

  const asignar = async (e) => {
    e.preventDefault();
    if (!docenteSeleccionado || !estudianteSeleccionado) return;
    setErrorAsignacion('');
    setAsignando(true);
    try {
      const nueva = await asignacionesService.crear(docenteSeleccionado, estudianteSeleccionado);
      setAsignaciones((prev) => [nueva, ...prev]);
      setDocenteSeleccionado('');
      setEstudianteSeleccionado('');
    } catch (err) {
      setErrorAsignacion(err.response?.data?.error || 'No se pudo crear la asignación.');
    } finally {
      setAsignando(false);
    }
  };

  const quitar = async (asignacion) => {
    setAccionando(`asig-${asignacion.id}`);
    try {
      await asignacionesService.quitar(asignacion.id);
      setAsignaciones((prev) => prev.filter((a) => a.id !== asignacion.id));
    } catch (err) {
      setErrorAsignacion(err.response?.data?.error || 'No se pudo quitar la asignación.');
    } finally {
      setAccionando(null);
    }
  };

  if (cargando) {
    return <p className="text-sm text-mk-muted text-center py-10">Cargando…</p>;
  }

  return (
    <div className="max-w-5xl space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-2xl font-semibold text-mk-ink">Gestionar Usuarios</h1>
        <p className="mt-1 text-sm text-mk-muted">
          Aprobá cuentas de Docente, activá o desactivá usuarios, y asigná Estudiantes a Docentes.
        </p>
      </div>

      {error && <p className="text-sm text-mk-error">{error}</p>}

      <section className="bg-mk-surface border border-mk-line rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-mk-line">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mk-muted">
            Usuarios ({usuarios.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mk-line text-left">
                <th className="px-5 py-3 font-semibold text-mk-muted text-[11px] uppercase tracking-[0.08em]">
                  Nombre
                </th>
                <th className="px-5 py-3 font-semibold text-mk-muted text-[11px] uppercase tracking-[0.08em]">
                  Email
                </th>
                <th className="px-5 py-3 font-semibold text-mk-muted text-[11px] uppercase tracking-[0.08em]">
                  Rol
                </th>
                <th className="px-5 py-3 font-semibold text-mk-muted text-[11px] uppercase tracking-[0.08em]">
                  Estado
                </th>
                <th className="px-5 py-3 font-semibold text-mk-muted text-[11px] uppercase tracking-[0.08em]">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mk-line">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-mk-ice transition-colors">
                  <td className="px-5 py-3.5 font-medium text-mk-ink">
                    {u.nombre} {u.apellido}
                  </td>
                  <td className="px-5 py-3.5 text-mk-muted">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-1.5 py-0.5 rounded border border-mk-line text-[11px] font-semibold text-mk-muted">
                      {rolLabel[u.tipo_usuario] || u.tipo_usuario}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        u.is_active ? 'bg-mk-success-bg text-mk-success' : 'bg-mk-error-bg text-mk-error'
                      }`}
                    >
                      {u.is_active ? 'Activo' : 'Inactivo / pendiente'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => alternarActivo(u)}
                      disabled={accionando === u.id}
                      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        u.is_active
                          ? 'border border-mk-line text-mk-muted hover:bg-mk-error-bg hover:text-mk-error'
                          : 'bg-mk-gold text-mk-ink hover:bg-mk-gold-dark'
                      }`}
                    >
                      {u.is_active ? (
                        <>
                          <UserX className="w-3.5 h-3.5" /> Desactivar
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" /> Activar
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-mk-surface border border-mk-line rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-mk-line">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mk-muted">
            Asignar Estudiantes a Docentes
          </h2>
        </div>

        <div className="p-5 border-b border-mk-line">
          {errorAsignacion && (
            <p className="mb-3 text-sm text-mk-error">{errorAsignacion}</p>
          )}
          <form onSubmit={asignar} className="flex flex-col sm:flex-row gap-3">
            <select
              value={docenteSeleccionado}
              onChange={(e) => setDocenteSeleccionado(e.target.value)}
              className="flex-1 h-11 px-3.5 rounded-md border border-mk-line bg-mk-surface text-sm text-mk-ink focus:border-mk-blue focus:ring-2 focus:ring-mk-blue/15 outline-none transition-colors"
            >
              <option value="">Seleccioná un docente…</option>
              {docentes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.usuario.nombre} {d.usuario.apellido}
                </option>
              ))}
            </select>
            <select
              value={estudianteSeleccionado}
              onChange={(e) => setEstudianteSeleccionado(e.target.value)}
              className="flex-1 h-11 px-3.5 rounded-md border border-mk-line bg-mk-surface text-sm text-mk-ink focus:border-mk-blue focus:ring-2 focus:ring-mk-blue/15 outline-none transition-colors"
            >
              <option value="">Seleccioná un estudiante…</option>
              {estudiantes.map((es) => (
                <option key={es.id} value={es.id}>
                  {es.usuario.nombre} {es.usuario.apellido}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={asignando || !docenteSeleccionado || !estudianteSeleccionado}
              className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-md bg-mk-gold text-mk-ink text-sm font-semibold hover:bg-mk-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Link2 className="w-4 h-4" />
              {asignando ? 'Asignando…' : 'Asignar'}
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mk-line text-left">
                <th className="px-5 py-3 font-semibold text-mk-muted text-[11px] uppercase tracking-[0.08em]">
                  Docente
                </th>
                <th className="px-5 py-3 font-semibold text-mk-muted text-[11px] uppercase tracking-[0.08em]">
                  Estudiante
                </th>
                <th className="px-5 py-3 font-semibold text-mk-muted text-[11px] uppercase tracking-[0.08em]">
                  Quitar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mk-line">
              {asignaciones.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-6 text-center text-mk-muted">
                    Todavía no hay estudiantes asignados a ningún docente.
                  </td>
                </tr>
              )}
              {asignaciones.map((a) => (
                <tr key={a.id} className="hover:bg-mk-ice transition-colors">
                  <td className="px-5 py-3.5 font-medium text-mk-ink">{a.docente_nombre}</td>
                  <td className="px-5 py-3.5 text-mk-muted">{a.estudiante_nombre}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => quitar(a)}
                      disabled={accionando === `asig-${a.id}`}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold border border-mk-line text-mk-muted hover:bg-mk-error-bg hover:text-mk-error transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <X className="w-3.5 h-3.5" /> Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
