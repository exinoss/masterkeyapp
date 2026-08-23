/**
 * Contexto de Autenticación para gestión de estado global del usuario
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario guardado al cargar
    const savedUser = authService.getUser();
    if (savedUser && authService.isAuthenticated()) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const userData = { ...response.usuario, perfil: response.perfil };
    setUser(userData);
    return response;
  };

  const registro = async (userData) => {
    const response = await authService.registro(userData);
    setUser(response.usuario);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const actualizarUsuario = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    registro,
    logout,
    actualizarUsuario,
    isAuthenticated: !!user,
    isEstudiante: user?.tipo_usuario === 'estudiante',
    isDocente: user?.tipo_usuario === 'docente',
    isAdmin: user?.tipo_usuario === 'administrador',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

export default AuthContext;
