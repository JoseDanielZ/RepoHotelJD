import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, Hotel, BedDouble, Users,
  Receipt, CreditCard, CheckSquare, LogOut, ChevronRight,
  Layers, Building2, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navGroups = [
  {
    label: 'Principal',
    items: [
      { to: '/backoffice', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { to: '/backoffice/reservas', label: 'Reservas', icon: CalendarCheck },
      { to: '/backoffice/checkin', label: 'Check-In', icon: CheckSquare },
      { to: '/backoffice/estadias', label: 'Estadías', icon: Hotel },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { to: '/backoffice/facturas', label: 'Facturas', icon: Receipt },
      { to: '/backoffice/pagos', label: 'Pagos', icon: CreditCard },
    ],
  },
  {
    label: 'Alojamiento',
    items: [
      { to: '/backoffice/alojamiento/sucursales', label: 'Sucursales', icon: Building2 },
      { to: '/backoffice/alojamiento/habitaciones', label: 'Habitaciones', icon: BedDouble },
      { to: '/backoffice/alojamiento/tipos', label: 'Tipos', icon: Layers },
    ],
  },
  {
    label: 'Seguridad',
    items: [
      { to: '/backoffice/seguridad/usuarios', label: 'Usuarios', icon: Users },
      { to: '/backoffice/seguridad/roles', label: 'Roles', icon: ShieldCheck },
    ],
  },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-navy-600 text-white flex flex-col min-h-screen">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-navy-500">
        <h1 className="font-serif text-xl font-bold text-gold-400">Hotel Kairos</h1>
        <p className="text-xs text-navy-300 mt-0.5">Panel de Gestión</p>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-navy-500 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gold-500 flex items-center justify-center text-sm font-bold text-white">
          {user?.username?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{user?.username}</p>
          <p className="text-xs text-navy-300 truncate">{user?.roles?.[0] ?? 'Staff'}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider px-3 mb-1.5">
              {group.label}
            </p>
            {group.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-gold-500 text-white'
                      : 'text-navy-200 hover:bg-navy-500 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-navy-500">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-navy-300 hover:bg-navy-500 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
