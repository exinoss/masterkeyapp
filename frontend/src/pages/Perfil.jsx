/**
 * Perfil — MasterKey
 * Datos de la cuenta (nivel de inglés/objetivos para Estudiante,
 * especialidad/experiencia para Docente) y cambio de contraseña.
 */
import { useState, useEffect } from 'react';
import { User, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const INPUT =
  'w-full px-3.5 h-11 rounded-md border border-mk-line bg-mk-surface text-mk-ink placeholder:text-mk-muted focus:border-mk-blue focus:ring-2 focus:ring-mk-blue/15 outline-none transition-colors disabled:bg-mk-ice disabled:text-mk-muted';
const LABEL = 'block text-sm font-medium text-mk-ink mb-1.5';

const nivelesIngles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function Perfil() {
  const { user, isEstudiante, isDocente, actualizarUsuario } = useAuth();

  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState({
    nombre: '',
    apellido: '',
    nivel_ingles: 'A1',
    objetivos: '',
    especialidad: '',
    años_experiencia: 0
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [passwords, setPasswords] = useState({
    password_actual: '',
    password_nuevo: '',
    password_confirm: ''
  });
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [mensajePassword, setMensajePassword] = useState('');
  const [errorPassword, setErrorPassword] = useState('');

  useEffect(() => {
    let activo = true;
    authService
      .getPerfil()
      .then(({ usuario, perfil }) => {
        if (!activo) return;
        setDatos({
          nombre: usuario.nombre || '',
          apellido: usuario.apellido || '',
          nivel_ingles: perfil?.nivel_ingles || 'A1',
          objetivos: perfil?.objetivos || '',
          especialidad: perfil?.especialidad || '',
          años_experiencia: perfil?.años_experiencia || 0
        });
      })
      .catch(() => {
        if (activo) setError('No se pudo cargar tu perfil.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos((prev) => ({ ...prev, [name]: value }));
    setMensaje('');
    setError('');
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje('');
    setError('');

    try {
      const perfilData = isEstudiante
        ? { nivel_ingles: datos.nivel_ingles, objetivos: datos.objetivos }
        : isDocente
          ? { especialidad: datos.especialidad, años_experiencia: datos.años_experiencia }
          : {};

      const response = await authService.actualizarPerfil({
        usuario: { nombre: datos.nombre, apellido: datos.apellido },
        perfil: perfilData
      });

      actualizarUsuario({ ...response.usuario, perfil: response.perfil });
      setMensaje('Perfil actualizado correctamente.');
    } catch {
      setError('No se pudo actualizar el perfil. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setMensajePassword('');
    setErrorPassword('');
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();

    if (passwords.password_nuevo !== passwords.password_confirm) {
      setErrorPassword('Las contraseñas nuevas no coinciden');
      return;
    }
    if (passwords.password_nuevo.length < 6) {
      setErrorPassword('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCambiandoPassword(true);
    setMensajePassword('');
    setErrorPassword('');

    try {
      await authService.cambiarPassword(passwords);
      setMensajePassword('Contraseña actualizada correctamente.');
      setPasswords({ password_actual: '', password_nuevo: '', password_confirm: '' });
    } catch (err) {
      setErrorPassword(err.response?.data?.error || 'No se pudo cambiar la contraseña.');
    } finally {
      setCambiandoPassword(false);
    }
  };

  if (cargando) {
    return <p className="text-sm text-mk-muted text-center py-10">Cargando…</p>;
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-2xl font-semibold text-mk-ink">Mi Perfil</h1>
        <p className="mt-1 text-sm text-mk-muted">Gestiona tu información personal</p>
      </div>

      {/* Datos del perfil */}
      <section className="bg-mk-surface border border-mk-line rounded-lg p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-md bg-mk-blue-soft text-mk-blue flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-mk-ink">Datos personales</h2>
            <p className="text-sm text-mk-muted">{user?.email}</p>
          </div>
        </div>

        {mensaje && (
          <div className="mb-4 px-4 py-3 rounded-md bg-mk-success-bg border border-mk-success/30 flex items-center gap-3">
            <CheckCircle className="w-[18px] h-[18px] text-mk-success shrink-0" />
            <p className="text-sm text-mk-success">{mensaje}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-md bg-mk-error-bg border border-mk-error/30 flex items-center gap-3">
            <AlertCircle className="w-[18px] h-[18px] text-mk-error shrink-0" />
            <p className="text-sm text-mk-error">{error}</p>
          </div>
        )}

        <form onSubmit={handleGuardar} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={datos.nombre}
                onChange={handleChange}
                required
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Apellido</label>
              <input
                type="text"
                name="apellido"
                value={datos.apellido}
                onChange={handleChange}
                required
                className={INPUT}
              />
            </div>
          </div>

          {isEstudiante && (
            <>
              <div>
                <label className={LABEL}>Nivel de inglés</label>
                <select
                  name="nivel_ingles"
                  value={datos.nivel_ingles}
                  onChange={handleChange}
                  className={INPUT}
                >
                  {nivelesIngles.map((nivel) => (
                    <option key={nivel} value={nivel}>
                      {nivel}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL}>Objetivos de aprendizaje</label>
                <textarea
                  name="objetivos"
                  value={datos.objetivos}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ej: Prepararme para entrevistas de trabajo en inglés"
                  className={`${INPUT} h-auto py-2.5 resize-none`}
                />
              </div>
            </>
          )}

          {isDocente && (
            <>
              <div>
                <label className={LABEL}>Especialidad</label>
                <input
                  type="text"
                  name="especialidad"
                  value={datos.especialidad}
                  onChange={handleChange}
                  placeholder="Ej: Inglés de negocios"
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL}>Años de experiencia</label>
                <input
                  type="number"
                  min="0"
                  name="años_experiencia"
                  value={datos.años_experiencia}
                  onChange={handleChange}
                  className={INPUT}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="h-11 px-5 rounded-md bg-mk-gold text-mk-ink text-sm font-semibold hover:bg-mk-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      </section>

      {/* Cambiar contraseña */}
      <section className="bg-mk-surface border border-mk-line rounded-lg p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-md bg-mk-blue-soft text-mk-blue flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-mk-ink">Cambiar contraseña</h2>
        </div>

        {mensajePassword && (
          <div className="mb-4 px-4 py-3 rounded-md bg-mk-success-bg border border-mk-success/30 flex items-center gap-3">
            <CheckCircle className="w-[18px] h-[18px] text-mk-success shrink-0" />
            <p className="text-sm text-mk-success">{mensajePassword}</p>
          </div>
        )}
        {errorPassword && (
          <div className="mb-4 px-4 py-3 rounded-md bg-mk-error-bg border border-mk-error/30 flex items-center gap-3">
            <AlertCircle className="w-[18px] h-[18px] text-mk-error shrink-0" />
            <p className="text-sm text-mk-error">{errorPassword}</p>
          </div>
        )}

        <form onSubmit={handleCambiarPassword} className="space-y-4">
          <div>
            <label className={LABEL}>Contraseña actual</label>
            <input
              type="password"
              name="password_actual"
              value={passwords.password_actual}
              onChange={handlePasswordChange}
              required
              className={INPUT}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Nueva contraseña</label>
              <input
                type="password"
                name="password_nuevo"
                value={passwords.password_nuevo}
                onChange={handlePasswordChange}
                required
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Confirmar</label>
              <input
                type="password"
                name="password_confirm"
                value={passwords.password_confirm}
                onChange={handlePasswordChange}
                required
                className={INPUT}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cambiandoPassword}
            className="h-11 px-5 rounded-md border border-mk-line text-sm font-semibold text-mk-ink hover:bg-mk-ice transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cambiandoPassword ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
        </form>
      </section>
    </div>
  );
}
