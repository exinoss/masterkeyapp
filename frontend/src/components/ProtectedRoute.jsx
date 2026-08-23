/**
 * Componente de Ruta Protegida
 * Redirige a login si el usuario no está autenticado
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-[#DEEFE7]/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#159A9C]/30 border-t-[#159A9C] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#002333] font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
