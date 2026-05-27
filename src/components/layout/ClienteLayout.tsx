import { Outlet, Link, NavLink } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { CalendarCheck, User } from 'lucide-react';

export function ClienteLayout() {
  return (
    <div className="min-h-screen bg-kairos-bg flex flex-col">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex gap-6 flex-1">
        {/* Sidebar cliente */}
        <aside className="w-56 flex-shrink-0">
          <div className="card sticky top-24">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Mi cuenta</p>
            <nav className="flex flex-col gap-1">
              <NavLink
                to="/cliente/reservas"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-gold-100 text-gold-800' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <CalendarCheck className="h-4 w-4" />Mis Reservas
              </NavLink>
            </nav>
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
