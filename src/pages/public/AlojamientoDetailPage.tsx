import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { alojamientoApi } from '../../api/alojamiento.api';
import { extractError } from '../../api/client';
import { PageSpinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { MapPin, Star, BedDouble, Users, Calendar, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import type { AccommodationDetailDTO, TipoHabitacionPublicDTO } from '../../types';

export default function AlojamientoDetailPage() {
  const { sucursalGuid } = useParams<{ sucursalGuid: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fechaInicio = searchParams.get('fechaInicio') ?? '';
  const fechaFin = searchParams.get('fechaFin') ?? '';
  const adultos = Number(searchParams.get('adultos') ?? 2);

  const [detail, setDetail] = useState<AccommodationDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (!sucursalGuid) return;
    setLoading(true);
    alojamientoApi.getDetail(sucursalGuid, { fechaInicio, fechaFin })
      .then(({ data }) => setDetail((data as any).data ?? data))
      .catch(err => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, [sucursalGuid]);

  if (loading) return <PageSpinner />;
  if (error) return <div className="max-w-4xl mx-auto px-6 py-8"><Alert message={error} /></div>;
  if (!detail) return null;

  const handleBook = (tipo: TipoHabitacionPublicDTO) => {
    const params = new URLSearchParams({
      sucursalGuid: sucursalGuid!,
      tipoHabitacionGuid: tipo.tipoHabitacionGuid,
      fechaInicio,
      fechaFin,
      adultos: String(adultos),
      nombre: detail.nombre,
    });
    navigate(`/booking?${params.toString()}`);
  };

  const nights = fechaInicio && fechaFin
    ? Math.max(1, Math.round((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / 86400000))
    : 1;

  const destino = [detail.ciudad, detail.provincia].filter(Boolean).join(', ');

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-navy-600 mb-5 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Volver a resultados
      </button>

      {/* Header */}
      <div className="card mb-6 overflow-hidden p-0">
        <div className="h-72 bg-gradient-to-br from-navy-400 to-navy-700 flex items-center justify-center relative overflow-hidden">
          {detail.imagenes?.length > 0 ? (
            <>
              <img
                src={detail.imagenes[imgIdx]}
                alt={`${detail.nombre} ${imgIdx + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              {detail.imagenes.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx(i => (i - 1 + detail.imagenes.length) % detail.imagenes.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setImgIdx(i => (i + 1) % detail.imagenes.length)}
                    className="absolute right-12 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {detail.imagenes.map((url, i) => (
                      <button
                        key={url}
                        onClick={() => setImgIdx(i)}
                        className={`h-2 rounded-full transition-all ${i === imgIdx ? 'w-5 bg-white' : 'w-2 bg-white/50'}`}
                      />
                    ))}
                  </div>
                  <div className="absolute bottom-3 right-4 bg-black/40 text-white text-xs rounded-lg px-2 py-0.5">
                    {imgIdx + 1} / {detail.imagenes.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <BedDouble className="h-24 w-24 text-white/20" />
          )}
          <div className="absolute top-4 right-4 bg-white/90 rounded-lg px-3 py-1 text-sm font-bold text-navy-600">
            {detail.tipoAlojamiento}
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="font-serif text-2xl font-bold text-gray-800 mb-1">{detail.nombre}</h1>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                {destino}
                {detail.direccion && ` · ${detail.direccion}`}
              </div>
            </div>
            {(detail.promedioValoracion ?? 0) > 0 && (
              <div className="flex items-center gap-1 text-gold-600 font-bold text-lg ml-4">
                <Star className="h-5 w-5 fill-gold-400 text-gold-400" />
                {detail.promedioValoracion!.toFixed(1)}
                <span className="text-sm text-gray-400 font-normal">({detail.totalValoraciones} reseñas)</span>
              </div>
            )}
          </div>
          {detail.descripcion && <p className="text-gray-600 leading-relaxed">{detail.descripcion}</p>}

          {detail.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {detail.amenities.map(s => (
                <span key={s} className="bg-navy-50 text-navy-600 text-xs font-medium px-3 py-1 rounded-full">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dates info bar */}
      {fechaInicio && fechaFin && (
        <div className="bg-gold-50 border border-gold-200 rounded-xl px-5 py-3 mb-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gold-600" />
            <span className="text-gray-600">Check-in: <strong>{fechaInicio}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gold-600" />
            <span className="text-gray-600">Check-out: <strong>{fechaFin}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gold-600" />
            <span className="text-gray-600"><strong>{adultos}</strong> adulto{adultos !== 1 ? 's' : ''}</span>
          </div>
          <span className="text-gray-500 ml-auto">{nights} noche{nights !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Room types */}
      <h2 className="font-serif text-xl font-bold text-navy-600 mb-4">Tipos de habitación disponibles</h2>
      {detail.tiposHabitacion?.length === 0 ? (
        <div className="card text-center py-10">
          <BedDouble className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No hay habitaciones disponibles para las fechas seleccionadas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {detail.tiposHabitacion?.map(tipo => (
            <TipoHabitacionCard
              key={tipo.tipoHabitacionGuid}
              tipo={tipo}
              nights={nights}
              onBook={() => handleBook(tipo)}
              canBook={!!fechaInicio && !!fechaFin}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TipoHabitacionCard({
  tipo, nights, onBook, canBook
}: Readonly<{
  tipo: TipoHabitacionPublicDTO;
  nights: number;
  onBook: () => void;
  canBook: boolean;
}>) {
  const total = tipo.precioBase * nights;
  const disponibles = tipo.disponiblesEnRango ?? 0;
  const capacidad = tipo.capacidadAdultos + tipo.capacidadNinos;

  return (
    <div className="card flex gap-5 p-0 overflow-hidden">
      <div className="w-40 h-32 bg-gradient-to-br from-navy-100 to-navy-200 flex-shrink-0 flex items-center justify-center">
        {tipo.imagenes?.length > 0 ? (
          <img src={tipo.imagenes[0]} alt={tipo.nombre} className="w-full h-full object-cover" />
        ) : (
          <BedDouble className="h-10 w-10 text-navy-400" />
        )}
      </div>
      <div className="flex-1 py-4 pr-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">{tipo.nombre}</h3>
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{capacidad} personas máx.</span>
              {disponibles > 0 && (
                <span className="text-green-600 font-medium">{disponibles} disponibles</span>
              )}
            </div>
            {tipo.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tipo.amenities.slice(0, 4).map(a => (
                  <span key={a} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{a}</span>
                ))}
              </div>
            )}
          </div>
          <div className="text-right ml-4 flex-shrink-0">
            <p className="text-xl font-bold text-navy-600">${tipo.precioBase.toFixed(2)}<span className="text-xs font-normal text-gray-400">/noche</span></p>
            {nights > 1 && <p className="text-sm text-gray-500">Total: ${total.toFixed(2)}</p>}
            <button
              onClick={onBook}
              disabled={disponibles === 0 || !canBook}
              className="btn-primary text-sm px-5 py-2 mt-3 flex items-center gap-1"
            >
              {disponibles === 0 ? 'Agotado' : 'Reservar'} <ChevronRight className="h-3 w-3" />
            </button>
            {canBook || disponibles === 0 ? null : (
              <p className="text-xs text-gray-400 mt-1">Selecciona fechas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
