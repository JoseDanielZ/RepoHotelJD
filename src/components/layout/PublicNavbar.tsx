import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, User, LogOut, LayoutDashboard } from 'lucide-react';

export function PublicNavbar() {
  const { isAuthenticated, isBackOffice, isCliente, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-kairos-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-navy-600">Hotel</span>
            <span className="font-serif text-2xl font-bold text-gold-500">Kairos</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-gold-600 transition-colors">
              Inicio
            </Link>
            <Link to="/search" className="text-sm font-medium text-gray-600 hover:text-gold-600 transition-colors">
              Alojamientos
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  <LogIn className="h-4 w-4 inline mr-1.5" />Ingresar
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Registrarme
                </Link>
              </>
            )}
            {isAuthenticated && isCliente && (
              <>
                <Link to="/cliente/reservas" className="text-sm font-medium text-gray-600 hover:text-gold-600">
                  <User className="h-4 w-4 inline mr-1" />Mis Reservas
                </Link>
                <button onClick={handleLogout} className="btn-ghost text-sm">
                  <LogOut className="h-4 w-4 inline mr-1" />Salir
                </button>
              </>
            )}
            {isAuthenticated && isBackOffice && (
              <>
                <Link to="/backoffice" className="btn-secondary text-sm">
                  <LayoutDashboard className="h-4 w-4 inline mr-1.5" />Panel Admin
                </Link>
                <button onClick={handleLogout} className="btn-ghost text-sm">
                  <LogOut className="h-4 w-4 inline mr-1" />Salir
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
