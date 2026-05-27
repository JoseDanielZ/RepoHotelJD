import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservasApi } from '../../api/reservas.api';
import { hospedajeApi } from '../../api/hospedaje.api';
import { extractError } from '../../api/client';
import { BedDouble, CalendarCheck, TrendingUp, Users, ChevronRight, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../../components/ui/Badge';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  link?: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [reservasPendientes, setReservasPendientes] = useState<any[]>([]);
  const [estadiasActivas, setEstadiasActivas] = useState<any[]>([]);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [loadingEstadias, setLoadingEstadias] = useState(true);

  useEffect(() => {
    reservasApi.list({ estadoReserva: 'PEN', pagina: 1, limite: 5 })
      .then(({ data }) => {
        const items = Array.isArray(data) ? data : (data as any).items ?? (data as any).data ?? [];
        setReservasPendientes(items);
      })
      .catch(() => {})
      .finally(() => setLoadingReservas(false));

    hospedajeApi.listEstadias({ estado: 'ACT', pagina: 1, limite: 5 })
      .then(({ data }) => {
        const items = Array.isArray(data) ? data : (data as any).items ?? (data as any).data ?? [];
        setEstadiasActivas(items);
      })
      .catch(() => {})
      .finally(() => setLoadingEstadias(false));
  }, []);

  const stats: StatCard[] = [
    {
      label: 'Reservas pendientes',
      value: reservasPendientes.length,
      icon: <CalendarCheck className="h-6 w-6" />,
      color: 'text-amber-600 bg-amber-50',
      link: '/backoffice/reservas',
    },
    {
      label: 'Estadías activas',
      value: estadiasActivas.length,
      icon: <BedDouble className="h-6 w-6" />,
      color: 'text-green-600 bg-green-50',
      link: '/backoffice/estadias',
    },
    {
      label: 'Check-in / Check-out',
      value: 'Gestionar',
      icon: <Users className="h-6 w-6" />,
      color: 'text-navy-600 bg-navy-50',
      link: '/backoffice/checkin',
    },
    {
      label: 'Facturación',
      value: 'Ver facturas',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-purple-600 bg-purple-50',
      link: '/backoffice/facturas',
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-gray-800 mb-6">Panel de control</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <button
            key={s.label}
            onClick={() => s.link && navigate(s.link)}
            className="card text-left hover:shadow-md transition-shadow"
          >
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-0.5">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reservas pendientes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Reservas pendientes</h2>
            <button onClick={() => navigate('/backoffice/reservas')} className="text-xs text-navy-600 hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {loadingReservas ? (
            <div className="text-sm text-gray-400 text-center py-4">Cargando...</div>
          ) : reservasPendientes.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-6">
              <CalendarCheck className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              No hay reservas pendientes
            </div>
          ) : (
            <div className="space-y-2">
              {reservasPendientes.map((r: any) => (
                <div
                  key={r.reservaGuid}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 rounded px-1"
                  onClick={() => navigate(`/backoffice/reservas/${r.reservaGuid}`)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.nombreCliente ?? r.codigoReserva}</p>
                    <p className="text-xs text-gray-500">{r.fechaInicio} → {r.fechaFin}</p>
                  </div>
                  <StatusBadge status={r.estadoReserva} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estadías activas */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Estadías activas</h2>
            <button onClick={() => navigate('/backoffice/estadias')} className="text-xs text-navy-600 hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {loadingEstadias ? (
            <div className="text-sm text-gray-400 text-center py-4">Cargando...</div>
          ) : estadiasActivas.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-6">
              <BedDouble className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              No hay estadías activas
            </div>
          ) : (
            <div className="space-y-2">
              {estadiasActivas.map((e: any) => (
                <div
                  key={e.estadiaGuid}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 rounded px-1"
                  onClick={() => navigate(`/backoffice/estadias/${e.estadiaGuid}`)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{e.nombreCliente ?? e.estadiaGuid}</p>
                    <p className="text-xs text-gray-500">Hab. {e.numeroHabitacion} · {e.fechaCheckIn}</p>
                  </div>
                  <StatusBadge status={e.estadoEstadia ?? 'ACT'} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
