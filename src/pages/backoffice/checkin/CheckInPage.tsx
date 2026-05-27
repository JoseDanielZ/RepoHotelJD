import { useState } from 'react';
import { reservasApi } from '../../../api/reservas.api';
import { hospedajeApi } from '../../../api/hospedaje.api';
import { extractError } from '../../../api/client';
import { Alert } from '../../../components/ui/Alert';
import { Spinner } from '../../../components/ui/Spinner';
import { StatusBadge } from '../../../components/ui/Badge';
import { Search, LogIn, LogOut } from 'lucide-react';

type TabType = 'checkin' | 'checkout';

export default function CheckInPage() {
  const [tab, setTab] = useState<TabType>('checkin');
  const [codigo, setCodigo] = useState('');
  const [reserva, setReserva] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const buscarReserva = async () => {
    if (!codigo.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    setReserva(null);
    try {
      const { data } = await reservasApi.buscarPorCodigo(codigo.trim());
      setReserva((data as any).data ?? data);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const doCheckIn = async () => {
    if (!reserva) return;
    setActionLoading(true);
    setError('');
    try {
      await reservasApi.checkIn(reserva.reservaGuid);
      setSuccess('Check-in realizado correctamente.');
      setReserva(null);
      setCodigo('');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setActionLoading(false);
    }
  };

  const doCheckOut = async () => {
    if (!reserva) return;
    setActionLoading(true);
    setError('');
    try {
      await reservasApi.checkOut(reserva.reservaGuid);
      setSuccess('Check-out realizado correctamente.');
      setReserva(null);
      setCodigo('');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl font-bold text-gray-800 mb-6">Check-in / Check-out</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {(['checkin', 'checkout'] as TabType[]).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setReserva(null); setError(''); setSuccess(''); setCodigo(''); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-white shadow text-navy-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'checkin' ? '🏨 Check-in' : '🚪 Check-out'}
          </button>
        ))}
      </div>

      {error && <Alert message={error} className="mb-4" />}
      {success && <Alert message={success} type="success" className="mb-4" />}

      <div className="card">
        <p className="text-sm text-gray-500 mb-4">
          {tab === 'checkin'
            ? 'Ingresa el código de reserva confirmada para registrar el check-in.'
            : 'Ingresa el código de reserva o número de estadía para registrar el check-out.'}
        </p>

        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="input-field pl-9"
              type="text"
              placeholder="RES-XXXXXXXX"
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscarReserva()}
            />
          </div>
          <button onClick={buscarReserva} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Spinner size="sm" /> : <Search className="h-4 w-4" />}
            Buscar
          </button>
        </div>

        {reserva && (
          <div className="bg-navy-50 border border-navy-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{reserva.nombreSucursal ?? 'Reserva encontrada'}</h3>
              <StatusBadge status={reserva.estadoReserva} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-gray-500">Código</p>
                <p className="font-mono font-medium">{reserva.codigoReserva}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Cliente</p>
                <p className="font-medium">{reserva.nombreCliente ?? `${reserva.cliente?.nombres ?? ''} ${reserva.cliente?.apellidos ?? ''}`}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Check-in</p>
                <p>{reserva.fechaInicio}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Check-out</p>
                <p>{reserva.fechaFin}</p>
              </div>
            </div>

            <div className="pt-2">
              {tab === 'checkin' && reserva.estadoReserva === 'CON' && (
                <button
                  onClick={doCheckIn}
                  disabled={actionLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Spinner size="sm" /> : <LogIn className="h-4 w-4" />}
                  Confirmar Check-in
                </button>
              )}
              {tab === 'checkout' && reserva.estadoReserva === 'CHI' && (
                <button
                  onClick={doCheckOut}
                  disabled={actionLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Spinner size="sm" /> : <LogOut className="h-4 w-4" />}
                  Confirmar Check-out
                </button>
              )}
              {tab === 'checkin' && reserva.estadoReserva !== 'CON' && (
                <p className="text-sm text-amber-600 text-center">
                  La reserva debe estar en estado <strong>CONFIRMADA</strong> para hacer check-in.
                </p>
              )}
              {tab === 'checkout' && reserva.estadoReserva !== 'CHI' && (
                <p className="text-sm text-amber-600 text-center">
                  La reserva debe tener el check-in realizado para hacer check-out.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
