import { Outlet } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-kairos-bg flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-navy-600 text-navy-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="font-serif text-lg text-gold-400 mb-1">Hotel Kairos</p>
          <p className="text-sm">© {new Date().getFullYear()} Hotel Kairos. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
