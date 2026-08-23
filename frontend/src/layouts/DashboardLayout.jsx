/**
 * Layout del Dashboard con Sidebar
 */
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Globe,
  Menu,
  X,
  LayoutDashboard,
  MessageSquare,
  FileText,
  Users,
  BarChart3,
  User,
  LogOut,
  ChevronRight,
  Bell,
  Settings
} from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout, isEstudiante, isDocente, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Menú según tipo de usuario
  const getMenuItems = () => {
    const baseItems = [
      { 
        path: '/dashboard', 
        icon: <LayoutDashboard className="w-5 h-5" />, 
        label: 'Dashboard',
        end: true
      }
    ];

    if (isEstudiante) {
      return [
        ...baseItems,
        { 
          path: '/dashboard/sesiones', 
          icon: <MessageSquare className="w-5 h-5" />, 
          label: 'Sesiones' 
        },
        { 
          path: '/dashboard/retroalimentaciones', 
          icon: <FileText className="w-5 h-5" />, 
          label: 'Retroalimentaciones' 
        },
        { 
          path: '/dashboard/estadisticas', 
          icon: <BarChart3 className="w-5 h-5" />, 
          label: 'Estadísticas' 
        },
        { 
          path: '/dashboard/perfil', 
          icon: <User className="w-5 h-5" />, 
          label: 'Perfil' 
        }
      ];
    }

    if (isDocente) {
      return [
        ...baseItems,
        { 
          path: '/dashboard/sesiones', 
          icon: <MessageSquare className="w-5 h-5" />, 
          label: 'Sesiones' 
        },
        { 
          path: '/dashboard/retroalimentaciones', 
          icon: <FileText className="w-5 h-5" />, 
          label: 'Retroalimentaciones' 
        },
        { 
          path: '/dashboard/reportes', 
          icon: <BarChart3 className="w-5 h-5" />, 
          label: 'Reporte Estudiantes' 
        },
        { 
          path: '/dashboard/grupo-estudiantes', 
          icon: <Users className="w-5 h-5" />, 
          label: 'Administrar Grupo' 
        },
        { 
          path: '/dashboard/estadisticas', 
          icon: <BarChart3 className="w-5 h-5" />, 
          label: 'Estadísticas' 
        },
        { 
          path: '/dashboard/perfil', 
          icon: <User className="w-5 h-5" />, 
          label: 'Perfil' 
        }
      ];
    }

    if (isAdmin) {
      return [
        ...baseItems,
        { 
          path: '/dashboard/sesiones', 
          icon: <MessageSquare className="w-5 h-5" />, 
          label: 'Sesiones' 
        },
        { 
          path: '/dashboard/retroalimentaciones', 
          icon: <FileText className="w-5 h-5" />, 
          label: 'Retroalimentaciones' 
        },
        { 
          path: '/dashboard/reportes', 
          icon: <BarChart3 className="w-5 h-5" />, 
          label: 'Reporte Estudiantes' 
        },
        { 
          path: '/dashboard/grupo-estudiantes', 
          icon: <Users className="w-5 h-5" />, 
          label: 'Administrar Grupo' 
        },
        { 
          path: '/dashboard/estadisticas', 
          icon: <BarChart3 className="w-5 h-5" />, 
          label: 'Estadísticas' 
        },
        { 
          path: '/dashboard/perfil', 
          icon: <User className="w-5 h-5" />, 
          label: 'Perfil' 
        }
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getTipoUsuarioLabel = () => {
    if (isEstudiante) return 'Estudiante';
    if (isDocente) return 'Docente';
    if (isAdmin) return 'Administrador';
    return 'Usuario';
  };

  return (
    <div className="min-h-screen bg-[#DEEFE7]/30">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#002333] hidden lg:flex flex-col z-50">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#159A9C] flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">AVI</span>
              <p className="text-xs text-white/50">Agente Virtual</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-[#159A9C] text-white shadow-lg shadow-[#159A9C]/30'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-[#159A9C] flex items-center justify-center text-white font-semibold">
              {user?.nombre?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {user?.nombre} {user?.apellido}
              </p>
              <p className="text-white/50 text-xs">{getTipoUsuarioLabel()}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-[#002333] z-50 lg:hidden transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#159A9C] flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AVI</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg text-white/70 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-[#159A9C] text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#B4BEC9]/20">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-[#DEEFE7] lg:hidden"
            >
              <Menu className="w-6 h-6 text-[#002333]" />
            </button>

            {/* Page Title - Hidden on mobile */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-[#002333]">
                Bienvenido, {user?.nombre}
              </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="p-2 rounded-xl hover:bg-[#DEEFE7] relative">
                <Bell className="w-5 h-5 text-[#002333]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#159A9C] rounded-full" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#DEEFE7]"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#159A9C] to-[#002333] flex items-center justify-center text-white text-sm font-semibold">
                    {user?.nombre?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-[#002333]">
                    {user?.nombre}
                  </span>
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#B4BEC9]/20 py-2 animate-fadeIn">
                    <NavLink
                      to="/dashboard/perfil"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-[#002333] hover:bg-[#DEEFE7]"
                    >
                      <User className="w-4 h-4" />
                      <span>Mi Perfil</span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/configuracion"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-[#002333] hover:bg-[#DEEFE7]"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Configuración</span>
                    </NavLink>
                    <hr className="my-2 border-[#B4BEC9]/20" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
