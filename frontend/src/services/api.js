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
      } catch (refreshError) {
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
    
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(usuario));
    
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
  async listar() {
    const response = await api.get('/sesiones/');
    return response.data;
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
  async listar(sesionId) {
    const response = await api.get('/retroalimentaciones/', {
      params: { sesion_id: sesionId },
    });
    return response.data;
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

// ==================== ESTUDIANTES ====================
export const estudiantesService = {
  async listar() {
    const response = await api.get('/estudiantes/');
    return response.data;
  },

  async obtener(id) {
    const response = await api.get(`/estudiantes/${id}/`);
    return response.data;
  },
};

export default api;
