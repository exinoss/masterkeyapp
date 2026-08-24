/**
 * Layout del Dashboard — MasterKey
 * Sidebar claro con marca, header de sección y contenido.
 */
import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  KeyRound,
  Menu,
  X,
  LayoutDashboard,
  MessageSquare,
  FileText,
  Users,
  BarChart3,
  User,
  LogOut,
  Bell,
  ChevronDown
} from 'lucide-react';

const ICON = 'w-[18px] h-[18px] shrink-0';

/* ---------- Piezas compartidas por ambos sidebars ---------- */

function Marca() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-md bg-mk-blue flex items-center justify-center">
        <KeyRound className="w-5 h-5 text-white" strokeWidth={2.2} />
      </div>
      <div className="leading-tight">
        <p className="font-display text-lg font-bold text-mk-ink tracking-tight">
          MasterKey
        </p>
        <p className="text-[11px] text-mk-muted">Academia de Inglés</p>
      </div>
    </div>
  );
}

function Navegacion({ items, onNavigate }) {
  return (
    <nav className="flex-1 px-3 py-5 overflow-y-auto">
      <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-mk-muted">
        Navegación
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-mk-blue text-white'
                    : 'text-mk-muted hover:bg-mk-ice hover:text-mk-ink'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function BloqueUsuario({ inicial, nombre, apellido, rol, onLogout }) {
  return (
    <div className="p-3 border-t border-mk-line">
      <div className="flex items-center gap-3 px-2 py-2">
        <div className="w-9 h-9 rounded-md bg-mk-blue-soft text-mk-blue flex items-center justify-center text-sm font-bold">
          {inicial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-mk-ink truncate">
            {nombre} {apellido}
          </p>
          <p className="text-[11px] uppercase tracking-[0.06em] text-mk-muted">
            {rol}
          </p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="w-full mt-1 flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-mk-muted hover:bg-mk-error-bg hover:text-mk-error transition-colors"
      >
        <LogOut className={ICON} />
        <span>Cerrar sesión</span>
      </button>
    </div>
  );
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isEstudiante, isDocente, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Menú según tipo de usuario
  const getMenuItems = () => {
    const inicio = {
      path: '/dashboard',
      icon: <LayoutDashboard className={ICON} />,
      label: 'Dashboard',
      end: true
    };

    const practica = [
      {
        path: '/dashboard/sesiones',
        icon: <MessageSquare className={ICON} />,
        label: 'Sesiones'
      },
      {
        path: '/dashboard/retroalimentaciones',
        icon: <FileText className={ICON} />,
        label: 'Retroalimentaciones'
      }
    ];

    const gestion = [
      {
        path: '/dashboard/reportes',
        icon: <BarChart3 className={ICON} />,
        label: 'Reporte Estudiantes'
      },
      {
        path: '/dashboard/grupo-estudiantes',
        icon: <Users className={ICON} />,
        label: 'Administrar Grupo'
      }
    ];

    const cierre = [
      {
        path: '/dashboard/estadisticas',
        icon: <BarChart3 className={ICON} />,
        label: 'Estadísticas'
      },
      {
        path: '/dashboard/perfil',
        icon: <User className={ICON} />,
        label: 'Perfil'
      }
    ];

    if (isEstudiante) return [inicio, ...practica, ...cierre];
    if (isDocente || isAdmin) return [inicio, ...practica, ...gestion, ...cierre];
    return [inicio];
  };

  const menuItems = getMenuItems();

  // Título de la sección actual, derivado de la ruta
  const seccionActual =
    menuItems
      .filter((item) =>
        item.end
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path)
      )
      .sort((a, b) => b.path.length - a.path.length)[0]?.label || 'Dashboard';

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

  const inicial = user?.nombre?.[0]?.toUpperCase() || 'U';

  const propsUsuario = {
    inicial,
    nombre: user?.nombre,
    apellido: user?.apellido,
    rol: getTipoUsuarioLabel(),
    onLogout: handleLogout
  };

  return (
    <div className="min-h-screen bg-mk-ice">
      {/* ---------- Sidebar desktop ---------- */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-mk-surface border-r border-mk-line hidden lg:flex flex-col z-50">
        <div className="h-16 px-5 flex items-center border-b border-mk-line">
          <Marca />
        </div>
        <Navegacion items={menuItems} />
        <BloqueUsuario {...propsUsuario} />
      </aside>

      {/* ---------- Sidebar móvil ---------- */}
      <div
        className={`fixed inset-0 bg-mk-ink/40 z-50 lg:hidden transition-opacity duration-200 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-mk-surface border-r border-mk-line z-50 lg:hidden flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-mk-line">
          <Marca />
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-9 h-9 rounded-md flex items-center justify-center text-mk-muted hover:bg-mk-ice hover:text-mk-ink transition-colors"
            aria-label="Cerrar menú"
          >
            <X className={ICON} />
          </button>
        </div>
        <Navegacion items={menuItems} onNavigate={() => setSidebarOpen(false)} />
        <BloqueUsuario {...propsUsuario} />
      </aside>

      {/* ---------- Contenido ---------- */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-mk-surface border-b border-mk-line">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-9 h-9 rounded-md flex items-center justify-center text-mk-muted hover:bg-mk-ice hover:text-mk-ink lg:hidden transition-colors"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="font-display text-[19px] font-semibold text-mk-ink truncate">
                {seccionActual}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="relative w-9 h-9 rounded-md border border-mk-line flex items-center justify-center text-mk-muted hover:bg-mk-ice hover:text-mk-ink transition-colors"
                aria-label="Notificaciones"
              >
                <Bell className={ICON} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-mk-gold rounded-full" />
              </button>

              <div className="w-px h-6 bg-mk-line mx-1" />

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-md hover:bg-mk-ice transition-colors"
                >
                  <div className="w-8 h-8 rounded-md bg-mk-blue-soft text-mk-blue flex items-center justify-center text-sm font-bold">
                    {inicial}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-mk-ink">
                    {user?.nombre}
                  </span>
                  <ChevronDown className="w-4 h-4 text-mk-muted" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-mk-surface rounded-lg border border-mk-line shadow-sm py-1.5 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-mk-line mb-1.5">
                      <p className="text-sm font-semibold text-mk-ink truncate">
                        {user?.nombre} {user?.apellido}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.06em] text-mk-muted">
                        {getTipoUsuarioLabel()}
                      </p>
                    </div>
                    <div className="px-1.5 flex flex-col gap-0.5">
                      <NavLink
                        to="/dashboard/perfil"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-2.5 py-2 rounded-md text-sm text-mk-muted hover:bg-mk-ice hover:text-mk-ink transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Mi perfil</span>
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-sm text-mk-muted hover:bg-mk-error-bg hover:text-mk-error transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Página */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
