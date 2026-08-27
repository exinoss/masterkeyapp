/**
 * Login / Registro — MasterKey
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandMark from '../components/BrandMark';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  LogIn,
  GraduationCap,
  BookOpen,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const INPUT =
  'w-full pl-11 pr-4 h-11 rounded-md border border-mk-line bg-mk-surface text-mk-ink placeholder:text-mk-muted focus:border-mk-blue focus:ring-2 focus:ring-mk-blue/15 outline-none transition-colors';
const INPUT_SIN_ICONO =
  'w-full px-3.5 h-11 rounded-md border border-mk-line bg-mk-surface text-mk-ink placeholder:text-mk-muted focus:border-mk-blue focus:ring-2 focus:ring-mk-blue/15 outline-none transition-colors';
const LABEL = 'block text-sm font-medium text-mk-ink mb-1.5';
const ICONO = 'absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-mk-muted';

export default function Login() {
  const navigate = useNavigate();
  const { login, registro } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formulario de Login
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Formulario de Registro
  const [registroForm, setRegistroForm] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    nombre: '',
    apellido: '',
    tipo_usuario: 'estudiante',
    nivel_ingles: 'A1',
    objetivos: '',
    especialidad: '',
    años_experiencia: 0
  });

  // Solo Estudiantes y Docentes pueden registrarse (Administradores se crean desde el panel admin)
  const tiposUsuario = [
    { value: 'estudiante', label: 'Estudiante', icon: <GraduationCap className="w-5 h-5" /> },
    { value: 'docente', label: 'Docente', icon: <BookOpen className="w-5 h-5" /> }
  ];

  const nivelesIngles = [
    { value: 'A1', label: 'A1 - Principiante' },
    { value: 'A2', label: 'A2 - Elemental' },
    { value: 'B1', label: 'B1 - Intermedio' },
    { value: 'B2', label: 'B2 - Intermedio alto' },
    { value: 'C1', label: 'C1 - Avanzado' },
    { value: 'C2', label: 'C2 - Maestría' }
  ];

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegistroChange = (e) => {
    const { name, value } = e.target;
    setRegistroForm({ ...registroForm, [name]: value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(loginForm.email, loginForm.password);
      setSuccess('¡Inicio de sesión exitoso!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (registroForm.password !== registroForm.password_confirm) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (registroForm.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const response = await registro(registroForm);
      if (response.pendiente_aprobacion) {
        // Docente recién registrado: no hay sesión que iniciar todavía.
        setSuccess(
          response.mensaje ||
            'Tu cuenta fue creada y está pendiente de aprobación por un administrador.'
        );
        setIsLogin(true);
        setRegistroForm({ ...registroForm, password: '', password_confirm: '' });
      } else {
        setSuccess('¡Registro exitoso! Bienvenido a MasterKey.');
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData) {
        const firstError = Object.values(errorData)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError('Error al registrarse. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mk-ice flex">
      {/* Panel izquierdo — decorativo */}
      <div className="hidden lg:flex lg:w-1/2 bg-mk-blue p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-white/15 flex items-center justify-center">
            <BrandMark className="w-6 h-6" />
          </div>
          <span className="font-display text-xl font-bold text-white tracking-tight">
            MasterKey
          </span>
        </Link>

        <div className="space-y-8">
          <h1 className="font-display text-4xl font-semibold text-white leading-tight">
            Aprende inglés con un tutor que te escucha
          </h1>
          <p className="text-white/75 text-lg leading-relaxed">
            Tu tutor virtual te ayuda a mejorar tu pronunciación y fluidez
            con retroalimentación personalizada en cada sesión.
          </p>

          <div className="space-y-3">
            {[
              'Práctica interactiva con tutor animado',
              'Retroalimentación de pronunciación',
              'Seguimiento de progreso detallado'
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-mk-gold shrink-0" />
                <span className="text-white/90">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/50 text-sm">
          © 2026 MasterKey — Academia de Inglés
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo para móvil */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-md bg-mk-blue flex items-center justify-center">
              <BrandMark className="w-6 h-6" />
            </div>
            <span className="font-display text-xl font-bold text-mk-ink tracking-tight">
              MasterKey
            </span>
          </div>

          {/* Tabs Login/Registro */}
          <div className="flex bg-mk-ice rounded-md p-1 mb-7 border border-mk-line">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`flex-1 h-10 rounded-[5px] text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                isLogin
                  ? 'bg-mk-surface text-mk-ink shadow-sm'
                  : 'text-mk-muted hover:text-mk-ink'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Iniciar sesión
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`flex-1 h-10 rounded-[5px] text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                !isLogin
                  ? 'bg-mk-surface text-mk-ink shadow-sm'
                  : 'text-mk-muted hover:text-mk-ink'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Registrarse
            </button>
          </div>

          {/* Mensajes de error/éxito */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-md bg-mk-error-bg border border-mk-error/30 flex items-center gap-3 animate-fadeIn">
              <AlertCircle className="w-[18px] h-[18px] text-mk-error shrink-0" />
              <p className="text-sm text-mk-error">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-5 px-4 py-3 rounded-md bg-mk-success-bg border border-mk-success/30 flex items-center gap-3 animate-fadeIn">
              <CheckCircle className="w-[18px] h-[18px] text-mk-success shrink-0" />
              <p className="text-sm text-mk-success">{success}</p>
            </div>
          )}

          {/* Formulario de Login */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4 animate-fadeIn">
              <div>
                <label className={LABEL}>Correo electrónico</label>
                <div className="relative">
                  <Mail className={ICONO} />
                  <input
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    required
                    placeholder="tu@email.com"
                    className={INPUT}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL}>Contraseña</label>
                <div className="relative">
                  <Lock className={ICONO} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    required
                    placeholder="••••••••"
                    className={`${INPUT} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mk-muted hover:text-mk-ink"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-md bg-mk-gold text-mk-ink font-semibold hover:bg-mk-gold-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-mk-ink/30 border-t-mk-ink rounded-full animate-spin" />
                ) : (
                  <>
                    Iniciar sesión
                    <ArrowRight className="w-[18px] h-[18px]" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Formulario de Registro */
            <form onSubmit={handleRegistro} className="space-y-4 animate-fadeIn">
              {/* Tipo de usuario */}
              <div>
                <label className={LABEL}>Tipo de usuario</label>
                <div className="grid grid-cols-2 gap-3">
                  {tiposUsuario.map((tipo) => (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => setRegistroForm({ ...registroForm, tipo_usuario: tipo.value })}
                      className={`p-3 rounded-md border transition-colors flex flex-col items-center gap-1.5 ${
                        registroForm.tipo_usuario === tipo.value
                          ? 'border-mk-blue bg-mk-blue-soft text-mk-blue'
                          : 'border-mk-line text-mk-muted hover:border-mk-blue/50'
                      }`}
                    >
                      {tipo.icon}
                      <span className="text-xs font-medium">{tipo.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={registroForm.nombre}
                    onChange={handleRegistroChange}
                    required
                    placeholder="Juan"
                    className={INPUT_SIN_ICONO}
                  />
                </div>
                <div>
                  <label className={LABEL}>Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    value={registroForm.apellido}
                    onChange={handleRegistroChange}
                    required
                    placeholder="Pérez"
                    className={INPUT_SIN_ICONO}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL}>Nombre de usuario</label>
                <div className="relative">
                  <User className={ICONO} />
                  <input
                    type="text"
                    name="username"
                    value={registroForm.username}
                    onChange={handleRegistroChange}
                    required
                    placeholder="juanperez"
                    className={INPUT}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL}>Correo electrónico</label>
                <div className="relative">
                  <Mail className={ICONO} />
                  <input
                    type="email"
                    name="email"
                    value={registroForm.email}
                    onChange={handleRegistroChange}
                    required
                    placeholder="tu@email.com"
                    className={INPUT}
                  />
                </div>
              </div>

              {/* Campos específicos para Estudiante */}
              {registroForm.tipo_usuario === 'estudiante' && (
                <div>
                  <label className={LABEL}>Nivel de inglés</label>
                  <select
                    name="nivel_ingles"
                    value={registroForm.nivel_ingles}
                    onChange={handleRegistroChange}
                    className={INPUT_SIN_ICONO}
                  >
                    {nivelesIngles.map((nivel) => (
                      <option key={nivel.value} value={nivel.value}>
                        {nivel.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Campos específicos para Docente */}
              {registroForm.tipo_usuario === 'docente' && (
                <div>
                  <label className={LABEL}>Especialidad</label>
                  <input
                    type="text"
                    name="especialidad"
                    value={registroForm.especialidad}
                    onChange={handleRegistroChange}
                    placeholder="Ej: Inglés de negocios"
                    className={INPUT_SIN_ICONO}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>Contraseña</label>
                  <div className="relative">
                    <Lock className={ICONO} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={registroForm.password}
                      onChange={handleRegistroChange}
                      required
                      placeholder="••••••"
                      className={INPUT}
                    />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Confirmar</label>
                  <div className="relative">
                    <Lock className={ICONO} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password_confirm"
                      value={registroForm.password_confirm}
                      onChange={handleRegistroChange}
                      required
                      placeholder="••••••"
                      className={INPUT}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-md bg-mk-gold text-mk-ink font-semibold hover:bg-mk-gold-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-mk-ink/30 border-t-mk-ink rounded-full animate-spin" />
                ) : (
                  <>
                    Crear cuenta
                    <ArrowRight className="w-[18px] h-[18px]" />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-center mt-6 text-sm text-mk-muted">
            <Link to="/" className="text-mk-blue hover:underline font-medium">
              ← Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
