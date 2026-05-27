import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { ClienteLayout } from './components/layout/ClienteLayout';
import { BackOfficeLayout } from './components/layout/BackOfficeLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/public/HomePage';
import SearchPage from './pages/public/SearchPage';
import AlojamientoDetailPage from './pages/public/AlojamientoDetailPage';
import BookingPage from './pages/public/BookingPage';
import MisReservasPage from './pages/cliente/MisReservasPage';
import ReservaDetailClientePage from './pages/cliente/ReservaDetailPage';
import DashboardPage from './pages/backoffice/DashboardPage';
import ReservasListPage from './pages/backoffice/reservas/ReservasListPage';
import ReservaDetailPage from './pages/backoffice/reservas/ReservaDetailPage';
import CheckInPage from './pages/backoffice/checkin/CheckInPage';
import EstadiasListPage from './pages/backoffice/estadias/EstadiasListPage';
import EstadiaDetailPage from './pages/backoffice/estadias/EstadiaDetailPage';
import FacturasListPage from './pages/backoffice/facturacion/FacturasListPage';
import PagosListPage from './pages/backoffice/facturacion/PagosListPage';
import SucursalesPage from './pages/backoffice/alojamiento/SucursalesPage';
import HabitacionesPage from './pages/backoffice/alojamiento/HabitacionesPage';
import TiposHabitacionPage from './pages/backoffice/alojamiento/TiposHabitacionPage';
import UsuariosPage from './pages/backoffice/seguridad/UsuariosPage';
import RolesPage from './pages/backoffice/seguridad/RolesPage';
import { PageSpinner } from './components/ui/Spinner';

const BACKOFFICE_ROLES = ['ADMINISTRADOR', 'ADMIN', 'RECEPCIONISTA', 'OPERATIVO', 'DESK_SERVICE'];

function RequireBackOffice({ children }: { children: React.ReactNode }) {
  const { user, loading, roles } = useAuth();
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.some(r => BACKOFFICE_ROLES.includes(r))) return <Navigate to="/cliente/reservas" replace />;
  return <>{children}</>;
}

function RequireCliente({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: '/cliente/reservas' }} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="alojamiento/:sucursalGuid" element={<AlojamientoDetailPage />} />
          <Route path="booking" element={<BookingPage />} />
        </Route>

        {/* Auth */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Cliente portal */}
        <Route path="cliente" element={
          <RequireCliente>
            <ClienteLayout />
          </RequireCliente>
        }>
          <Route index element={<Navigate to="reservas" replace />} />
          <Route path="reservas" element={<MisReservasPage />} />
          <Route path="reservas/:reservaGuid" element={<ReservaDetailClientePage />} />
        </Route>

        {/* Back-office */}
        <Route path="backoffice" element={
          <RequireBackOffice>
            <BackOfficeLayout />
          </RequireBackOffice>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="reservas" element={<ReservasListPage />} />
          <Route path="reservas/:reservaGuid" element={<ReservaDetailPage />} />
          <Route path="checkin" element={<CheckInPage />} />
          <Route path="estadias" element={<EstadiasListPage />} />
          <Route path="estadias/:estadiaGuid" element={<EstadiaDetailPage />} />
          <Route path="facturas" element={<FacturasListPage />} />
          <Route path="pagos" element={<PagosListPage />} />
          <Route path="alojamiento/sucursales" element={<SucursalesPage />} />
          <Route path="alojamiento/habitaciones" element={<HabitacionesPage />} />
          <Route path="alojamiento/tipos" element={<TiposHabitacionPage />} />
          <Route path="seguridad/usuarios" element={<UsuariosPage />} />
          <Route path="seguridad/roles" element={<RolesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
