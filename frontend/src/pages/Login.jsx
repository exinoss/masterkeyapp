/**
 * Página de Login y Registro
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Globe, 
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
    { value: 'estudiante', label: 'Estudiante', icon: <GraduationCap className="w-5 h-5" />, description: 'Aprende y practica inglés' },
    { value: 'docente', label: 'Docente', icon: <BookOpen className="w-5 h-5" />, description: 'Supervisa estudiantes' }
  ];

  const nivelesIngles = [
    { value: 'A1', label: 'A1 - Principiante' },
    { value: 'A2', label: 'A2 - Elemental' },
    { value: 'B1', label: 'B1 - Intermedio' },
    { value: 'B2', label: 'B2 - Intermedio Alto' },
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
      await registro(registroForm);
      setSuccess('¡Registro exitoso! Bienvenido a AVI.');
      setTimeout(() => navigate('/dashboard'), 1000);
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
    <div className="min-h-screen bg-gradient-to-br from-[#DEEFE7] via-[#FFFFFF] to-[#DEEFE7] flex">
      {/* Panel Izquierdo - Decorativo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#002333] to-[#159A9C] p-12 flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">AVI</span>
          </Link>
        </div>

        <div className="space-y-8">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Aprende inglés con inteligencia artificial
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Nuestro agente virtual te ayudará a mejorar tu pronunciación 
            y fluidez con retroalimentación personalizada en tiempo real.
          </p>
          
          <div className="space-y-4">
            {[
              'Práctica interactiva con avatar 3D',
              'Retroalimentación de pronunciación',
              'Seguimiento de progreso detallado'
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/60 text-sm">
          © 2024 AVI - Agente Virtual Inteligente
        </p>
      </div>

      {/* Panel Derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo para móvil */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#159A9C] to-[#002333] flex items-center justify-center">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#002333]">AVI</span>
          </div>

          {/* Tabs Login/Registro */}
          <div className="flex bg-[#DEEFE7] rounded-xl p-1 mb-8">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                isLogin 
                  ? 'bg-white text-[#002333] shadow-md' 
                  : 'text-[#B4BEC9] hover:text-[#002333]'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                !isLogin 
                  ? 'bg-white text-[#002333] shadow-md' 
                  : 'text-[#B4BEC9] hover:text-[#002333]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Registrarse
            </button>
          </div>

          {/* Mensajes de Error/Éxito */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3 animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Formulario de Login */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-[#002333] mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B4BEC9]" />
                  <input
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    required
                    placeholder="tu@email.com"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-[#B4BEC9]/40 focus:border-[#159A9C] focus:ring-2 focus:ring-[#159A9C]/20 outline-none transition-all bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#002333] mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B4BEC9]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-[#B4BEC9]/40 focus:border-[#159A9C] focus:ring-2 focus:ring-[#159A9C]/20 outline-none transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B4BEC9] hover:text-[#002333]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-[#159A9C] text-white font-semibold hover:bg-[#002333] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#159A9C]/30 hover:shadow-[#002333]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Formulario de Registro */
            <form onSubmit={handleRegistro} className="space-y-5 animate-fadeIn">
              {/* Tipo de Usuario */}
              <div>
                <label className="block text-sm font-medium text-[#002333] mb-3">
                  Tipo de Usuario
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {tiposUsuario.map((tipo) => (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => setRegistroForm({ ...registroForm, tipo_usuario: tipo.value })}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                        registroForm.tipo_usuario === tipo.value
                          ? 'border-[#159A9C] bg-[#159A9C]/10 text-[#159A9C]'
                          : 'border-[#B4BEC9]/40 hover:border-[#159A9C]/50 text-[#B4BEC9]'
                      }`}
                    >
                      {tipo.icon}
                      <span className="text-xs font-medium">{tipo.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#002333] mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={registroForm.nombre}
                    onChange={handleRegistroChange}
                    required
                    placeholder="Juan"
                    className="w-full px-4 py-3 rounded-xl border border-[#B4BEC9]/40 focus:border-[#159A9C] focus:ring-2 focus:ring-[#159A9C]/20 outline-none transition-all bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#002333] mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={registroForm.apellido}
                    onChange={handleRegistroChange}
                    required
                    placeholder="Pérez"
                    className="w-full px-4 py-3 rounded-xl border border-[#B4BEC9]/40 focus:border-[#159A9C] focus:ring-2 focus:ring-[#159A9C]/20 outline-none transition-all bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#002333] mb-2">
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B4BEC9]" />
                  <input
                    type="text"
                    name="username"
                    value={registroForm.username}
                    onChange={handleRegistroChange}
                    required
                    placeholder="juanperez"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#B4BEC9]/40 focus:border-[#159A9C] focus:ring-2 focus:ring-[#159A9C]/20 outline-none transition-all bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#002333] mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B4BEC9]" />
                  <input
                    type="email"
                    name="email"
                    value={registroForm.email}
                    onChange={handleRegistroChange}
                    required
                    placeholder="tu@email.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#B4BEC9]/40 focus:border-[#159A9C] focus:ring-2 focus:ring-[#159A9C]/20 outline-none transition-all bg-white"
                  />
                </div>
              </div>

              {/* Campos específicos para Estudiante */}
              {registroForm.tipo_usuario === 'estudiante' && (
                <div>
                  <label className="block text-sm font-medium text-[#002333] mb-2">
                    Nivel de Inglés
                  </label>
                  <select
                    name="nivel_ingles"
                    value={registroForm.nivel_ingles}
                    onChange={handleRegistroChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#B4BEC9]/40 focus:border-[#159A9C] focus:ring-2 focus:ring-[#159A9C]/20 outline-none transition-all bg-white"
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
                  <label className="block text-sm font-medium text-[#002333] mb-2">
                    Especialidad
                  </label>
                  <input
                    type="text"
                    name="especialidad"
                    value={registroForm.especialidad}
                    onChange={handleRegistroChange}
                    placeholder="Ej: Inglés de negocios"
                    className="w-full px-4 py-3 rounded-xl border border-[#B4BEC9]/40 focus:border-[#159A9C] focus:ring-2 focus:ring-[#159A9C]/20 outline-none transition-all bg-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#002333] mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B4BEC9]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={registroForm.password}
                      onChange={handleRegistroChange}
                      required
                      placeholder="••••••"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#B4BEC9]/40 focus:border-[#159A9C] focus:ring-2 focus:ring-[#159A9C]/20 outline-none transition-all bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#002333] mb-2">
                    Confirmar
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B4BEC9]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password_confirm"
                      value={registroForm.password_confirm}
                      onChange={handleRegistroChange}
                      required
                      placeholder="••••••"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#B4BEC9]/40 focus:border-[#159A9C] focus:ring-2 focus:ring-[#159A9C]/20 outline-none transition-all bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-[#159A9C] text-white font-semibold hover:bg-[#002333] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#159A9C]/30 hover:shadow-[#002333]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Crear Cuenta
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Link a Home */}
          <p className="text-center mt-6 text-[#B4BEC9]">
            <Link to="/" className="text-[#159A9C] hover:text-[#002333] font-medium">
              ← Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
