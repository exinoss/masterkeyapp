/**
 * Gestionar Usuarios — MasterKey (solo Administrador)
 * Aprobar/activar-desactivar cuentas.
 *
 * La vinculación Docente-Estudiante ya no se hace a mano acá: el Docente
 * crea un curso con código (ver "Mis Cursos") y el Estudiante se une solo
 * (ver "Unirme a un curso"). Antes había una sección de asignación manual
 * en esta misma pantalla — se sacó a pedido del usuario, para no tener
 * dos formas de crear la misma relación que puedan desincronizarse.
 */
import { useState, useEffect, useCallback } from 'react';
import { UserCheck, UserX } from 'lucide-react';
import { usuariosService } from '../services/api';

const rolLabel = { estudiante: 'Estudiante', docente: 'Docente', administrador: 'Administrador' };

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [accionando, setAccionando] = useState(null);

  const cargarUsuarios = useCallback(async () => {
    try {
      const data = await usuariosService.listar();
      setUsuarios(data);
    } catch {
      setError('No se pudo cargar la información de usuarios.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

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

  if (cargando) {
    return <p className="text-sm text-mk-muted text-center py-10">Cargando…</p>;
  }

  return (
    <div className="max-w-5xl space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-2xl font-semibold text-mk-ink">Gestionar Usuarios</h1>
        <p className="mt-1 text-sm text-mk-muted">
          Aprobá cuentas de Docente y activá o desactivá usuarios.
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
    </div>
  );
}
