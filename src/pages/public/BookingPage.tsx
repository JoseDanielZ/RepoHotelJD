import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { reservasApi } from '../../api/reservas.api';
import { extractError } from '../../api/client';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { CheckCircle2, ChevronRight, Calendar, MapPin, Copy } from 'lucide-react';

type Step = 1 | 2 | 3;

const tiposIdentificacion = ['CC', 'CE', 'PAS', 'NIT'];
const metodosPago = ['TARJETA', 'EFECTIVO', 'TRANSFERENCIA'];

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reservaCreada, setReservaCreada] = useState<string | null>(null);

  const sucursalGuid = searchParams.get('sucursalGuid') ?? '';
  const tipoHabitacionGuid = searchParams.get('tipoHabitacionGuid') ?? '';
  const fechaInicio = searchParams.get('fechaInicio') ?? '';
  const fechaFin = searchParams.get('fechaFin') ?? '';
  const nombreSucursal = searchParams.get('nombre') ?? 'Alojamiento seleccionado';

  const [cliente, setCliente] = useState({
    tipoIdentificacion: 'CC',
    numeroIdentificacion: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    direccion: '',
  });

  const [pago, setPago] = useState({
    metodoPago: 'TARJETA',
    monto: 0,
    simularPago: true,
  });

  const [adultos, setAdultos] = useState(Number(searchParams.get('adultos') ?? 2));
  const [ninos, setNinos] = useState(0);

  const handleCreateReserva = async (e: FormEvent) => {
    e.preventDefault();
    if (!sucursalGuid || !fechaInicio || !fechaFin) {
      setError('Faltan datos de la reserva. Vuelve a seleccionar el alojamiento.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await reservasApi.createReservaPublic({
        sucursalGuid,
        fechaInicio,
        fechaFin,
        origenCanalReserva: 'MARKETPLACE',
        observaciones: null,
        cliente: {
          tipoIdentificacion: cliente.tipoIdentificacion,
          numeroIdentificacion: cliente.numeroIdentificacion,
          nombres: cliente.nombres,
          apellidos: cliente.apellidos,
          correo: cliente.correo,
          telefono: cliente.telefono,
          direccion: cliente.direccion || null,
        },
        habitaciones: [{
          tipoHabitacionGuid,
          numHabitaciones: 1,
          numAdultos: adultos,
          numNinos: ninos,
        }],
      });

      const reservaData = (data as any).data ?? data;
      // Never use reservaData.sucursalGuid — backend may return a different one.
      // Only extract identifiers that are safe to use.
      setReservaCreada(reservaData.codigoReserva ?? reservaData.reservaGuid ?? '');
      setStep(3);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    navigator.clipboard.writeText(reservaCreada ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 3) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className="card">
          <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-9 w-9 text-green-500" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-gray-800 mb-1">¡Reserva creada!</h2>
          <p className="text-gray-500 text-sm mb-5">Tu solicitud fue registrada exitosamente.</p>

          {/* Código — siempre del response, nunca el sucursalGuid */}
          <button
            onClick={copyCode}
            className="w-full bg-navy-50 border border-navy-100 rounded-xl px-4 py-3 mb-5 flex items-center justify-between hover:bg-navy-100 transition-colors"
          >
            <div className="text-left">
              <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-0.5">Código de reserva</p>
              <p className="font-mono text-lg font-bold text-navy-700">{reservaCreada}</p>
            </div>
            <Copy className={`h-4 w-4 flex-shrink-0 ${copied ? 'text-green-500' : 'text-navy-300'}`} />
          </button>
          {copied && <p className="text-xs text-green-600 -mt-3 mb-3">¡Copiado!</p>}

          {/* Detalles — siempre de los URL params, nunca del response */}
          <div className="grid grid-cols-2 gap-2 text-sm mb-5">
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-left col-span-2">
              <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" /> Alojamiento</p>
              <p className="font-medium text-gray-700">{nombreSucursal}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-left">
              <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><Calendar className="h-3 w-3" /> Check-in</p>
              <p className="font-medium text-gray-700">{fechaInicio}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-left">
              <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><Calendar className="h-3 w-3" /> Check-out</p>
              <p className="font-medium text-gray-700">{fechaFin}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate('/')} className="btn-outline flex-1 text-sm">Inicio</button>
            <button onClick={() => navigate('/cliente/reservas')} className="btn-primary flex-1 text-sm flex items-center justify-center gap-1">
              Mis reservas <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy-600 mb-1">Completar reserva</h1>
        <p className="text-gray-500 text-sm">{nombreSucursal} · {fechaInicio} → {fechaFin}</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s ? 'bg-gold-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>{s}</div>
            <span className={`text-sm font-medium ${step >= s ? 'text-gray-800' : 'text-gray-400'}`}>
              {s === 1 ? 'Datos del huésped' : 'Resumen'}
            </span>
            {s < 2 && <ChevronRight className="h-4 w-4 text-gray-300" />}
          </div>
        ))}
      </div>

      {error && <Alert message={error} className="mb-4" />}

      {step === 1 && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Información del huésped principal</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de documento</label>
              <select className="input-field" value={cliente.tipoIdentificacion}
                onChange={(e) => setCliente({ ...cliente, tipoIdentificacion: e.target.value })}>
                {tiposIdentificacion.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Número de documento *</label>
              <input className="input-field" type="text" value={cliente.numeroIdentificacion}
                onChange={(e) => setCliente({ ...cliente, numeroIdentificacion: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombres *</label>
              <input className="input-field" type="text" value={cliente.nombres}
                onChange={(e) => setCliente({ ...cliente, nombres: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Apellidos</label>
              <input className="input-field" type="text" value={cliente.apellidos}
                onChange={(e) => setCliente({ ...cliente, apellidos: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Correo *</label>
              <input className="input-field" type="email" value={cliente.correo}
                onChange={(e) => setCliente({ ...cliente, correo: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono *</label>
              <input className="input-field" type="tel" value={cliente.telefono}
                onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Dirección</label>
              <input className="input-field" type="text" value={cliente.direccion}
                onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Adultos</label>
              <select className="input-field" value={adultos} onChange={(e) => setAdultos(Number(e.target.value))}>
                {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Niños</label>
              <select className="input-field" value={ninos} onChange={(e) => setNinos(Number(e.target.value))}>
                {[0,1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <button
            className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
            onClick={() => {
              if (!cliente.nombres || !cliente.correo || !cliente.telefono || !cliente.numeroIdentificacion) {
                setError('Completa los campos obligatorios (*).');
                return;
              }
              setError('');
              setStep(2);
            }}
          >
            Continuar <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleCreateReserva} className="card space-y-4">
          <h2 className="font-semibold text-gray-800 mb-2">Resumen de la reserva</h2>
          <div className="bg-navy-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Alojamiento</span><span className="font-medium">{nombreSucursal}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Check-in</span><span>{fechaInicio}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Check-out</span><span>{fechaFin}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Huéspedes</span><span>{adultos} adultos{ninos > 0 ? `, ${ninos} niños` : ''}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Nombre</span><span>{cliente.nombres} {cliente.apellidos}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Correo</span><span>{cliente.correo}</span></div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">Atrás</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading && <Spinner size="sm" />}
              {loading ? 'Procesando...' : 'Confirmar reserva'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
