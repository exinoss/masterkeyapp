/**
 * App principal con enrutamiento
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sesiones from './pages/Sesiones';
import Retroalimentaciones from './pages/Retroalimentaciones';
import Estadisticas from './pages/Estadisticas';
import Perfil from './pages/Perfil';
import Reportes from './pages/Reportes';
import GrupoEstudiantes from './pages/GrupoEstudiantes';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas - Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="sesiones" element={<Sesiones />} />
            <Route path="retroalimentaciones" element={<Retroalimentaciones />} />
            <Route path="estadisticas" element={<Estadisticas />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="grupo-estudiantes" element={<GrupoEstudiantes />} />
          </Route>

          {/* Redirigir rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
