/**
 * Servicio API para comunicación con el backend Django
 */
import axios from 'axios';

// En producción leerá la variable de entorno de Render, y en local usará 127.0.0.1 por defecto.
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró, intentar refrescarlo
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch {
        // Si falla el refresh, limpiar tokens y redirigir a login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login/', { email, password });
    const { tokens, usuario, perfil } = response.data;
    
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify({ ...usuario, perfil }));
    
    return response.data;
  },

  async registro(userData) {
    const response = await api.post('/auth/registro/', userData);
    const { tokens, usuario } = response.data;

    // Un Docente recién registrado queda pendiente de aprobación: el
    // backend no manda tokens en ese caso (ver AuthContext.registro /
    // Login.jsx, que muestran el mensaje de "pendiente" en vez de loguear).
    if (tokens) {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(usuario));
    }

    return response.data;
  },

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await api.post('/auth/logout/', { refresh: refreshToken });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  async getPerfil() {
    const response = await api.get('/auth/perfil/');
    return response.data;
  },

  async actualizarPerfil(data) {
    const response = await api.put('/auth/perfil/', data);
    return response.data;
  },

  async cambiarPassword(data) {
    const response = await api.post('/auth/cambiar-password/', data);
    return response.data;
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },
};

// ==================== SESIONES ====================
export const sesionesService = {
  // GET /sesiones/ está paginado por DRF (PageNumberPagination, 20 por
  // página) — devuelve {count, next, previous, results}. Se expone solo
  // `results` porque hoy ningún caller pagina la UI; si el historial crece
  // más allá de una página, este es el punto a extender.
  async listar() {
    const response = await api.get('/sesiones/');
    return response.data.results;
  },

  async obtener(id) {
    const response = await api.get(`/sesiones/${id}/`);
    return response.data;
  },

  async crear(data) {
    const response = await api.post('/sesiones/', data);
    return response.data;
  },

  async finalizar(id) {
    const response = await api.post(`/sesiones/${id}/finalizar/`);
    return response.data;
  },

  // Frase de práctica generada por DeepSeek (o el respaldo del backend si
  // la IA no está disponible) — reemplaza la elección aleatoria local.
  // `fraseAnterior` evita que DeepSeek repita la última frase practicada
  // (tiende a hacerlo para combinaciones muy típicas de tema/nivel).
  async siguienteFrase(id, fraseAnterior) {
    const response = await api.post(`/sesiones/${id}/siguiente-frase/`, {
      frase_anterior: fraseAnterior || undefined
    });
    return response.data;
  },
};

// ==================== INTERACCIÓN ====================
export const interaccionService = {
  async enviar(data) {
    const response = await api.post('/interaccion/', data);
    return response.data;
  },
};

// ==================== RETROALIMENTACIÓN ====================
export const retroalimentacionService = {
  // También paginado por DRF — ver nota en sesionesService.listar().
  async listar(sesionId) {
    const response = await api.get('/retroalimentaciones/', {
      params: { sesion_id: sesionId },
    });
    return response.data.results;
  },
};

// ==================== ESTADÍSTICAS ====================
export const estadisticasService = {
  async obtener() {
    const response = await api.get('/estadisticas/');
    return response.data;
  },
};

// ==================== REPORTES ====================
export const reportesService = {
  async estudiantes() {
    const response = await api.get('/reportes/estudiantes/');
    return response.data;
  },
};

// ==================== GESTIÓN DE USUARIOS (Administrador) ====================
export const usuariosService = {
  async listar() {
    const response = await api.get('/usuarios/');
    return response.data.results;
  },

  async activar(id) {
    const response = await api.post(`/usuarios/${id}/activar/`);
    return response.data;
  },

  async desactivar(id) {
    const response = await api.post(`/usuarios/${id}/desactivar/`);
    return response.data;
  },
};

// ==================== CURSOS (código de acceso) ====================
// Reemplaza la asignación manual Docente-Estudiante: el Docente crea un
// curso con fechas y recibe un código; el Estudiante se une solo.
export const cursosService = {
  // Docente: sus propios cursos. Administrador: todos.
  async listar() {
    const response = await api.get('/cursos/');
    return response.data.results;
  },

  // Docente: crea un curso ({ nombre, fecha_inicio, fecha_fin }); el
  // backend genera el código y lo devuelve en la respuesta.
  async crear(data) {
    const response = await api.post('/cursos/', data);
    return response.data;
  },

  // Estudiante: se une con el código.
  async unirse(codigo) {
    const response = await api.post('/cursos/unirse/', { codigo });
    return response.data;
  },

  // Estudiante: su inscripción más reciente, o { inscripcion: null }.
  async miCurso() {
    const response = await api.get('/cursos/mi-curso/');
    return response.data;
  },
};

export default api;
