import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { alojamientoApi } from '../../api/alojamiento.api';
import { extractError } from '../../api/client';
import { PageSpinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import type { AccommodationSearchItemDTO } from '../../types';
import { MapPin, Star, BedDouble, Search } from 'lucide-react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [results, setResults] = useState<AccommodationSearchItemDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [destino, setDestino] = useState(searchParams.get('Destino') ?? '');
  const [fechaInicio, setFechaInicio] = useState(searchParams.get('fechaInicio') ?? '');
  const [fechaFin, setFechaFin] = useState(searchParams.get('fechaFin') ?? '');
  const [adultos, setAdultos] = useState(Number(searchParams.get('NumAdultos') ?? 1));

  const precioMax = Number(searchParams.get('PrecioMax') ?? 0);

  const doSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await alojamientoApi.search({
        Destino: destino || undefined,
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        NumAdultos: adultos > 0 ? adultos : undefined,
        PrecioMax: precioMax > 0 ? precioMax : undefined,
        Pagina: 1,
        Limite: 20,
      });
      const items = Array.isArray(data) ? data : (data as any).items ?? [];
      setResults(items);
      setTotal((data as any).totalResultados ?? (data as any).totalCount ?? items.length);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { doSearch(); }, []);

  const handleSearch = () => {
    const p: Record<string, string> = {};
    if (destino) p['Destino'] = destino;
    if (fechaInicio) p['fechaInicio'] = fechaInicio;
    if (fechaFin) p['fechaFin'] = fechaFin;
    if (adultos > 0) p['NumAdultos'] = String(adultos);
    setSearchParams(p);
    doSearch();
  };

  const today = new Date().toISOString().split('T')[0];
  const plural = total === 1 ? '' : 's';
  const resumen = `${total} alojamiento${plural} encontrado${plural}`;

  function renderResults() {
    if (loading) return <PageSpinner />;
    if (results.length === 0) {
      return (
        <div className="card text-center py-16">
          <BedDouble className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No encontramos alojamientos disponibles.</p>
          <p className="text-sm text-gray-400 mt-1">Intenta con otros criterios de búsqueda.</p>
        </div>
      );
    }
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((item) => (
          <AlojamientoCard
            key={item.sucursalGuid}
            item={item}
            href={`/alojamiento/${item.sucursalGuid}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&adultos=${adultos}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <label htmlFor="s-destino" className="block text-xs font-medium text-gray-500 mb-1">Destino</label>
            <input id="s-destino" className="input-field" type="text" placeholder="Ciudad o hotel" value={destino}
              onChange={(e) => setDestino(e.target.value)} />
          </div>
          <div>
            <label htmlFor="s-llegada" className="block text-xs font-medium text-gray-500 mb-1">Llegada</label>
            <input id="s-llegada" className="input-field" type="date" min={today} value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <div>
            <label htmlFor="s-salida" className="block text-xs font-medium text-gray-500 mb-1">Salida</label>
            <input id="s-salida" className="input-field" type="date" min={fechaInicio || today} value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)} />
          </div>
          <div>
            <label htmlFor="s-adultos" className="block text-xs font-medium text-gray-500 mb-1">Adultos</label>
            <select id="s-adultos" className="input-field" value={adultos} onChange={(e) => setAdultos(Number(e.target.value))}>
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button onClick={handleSearch} disabled={loading} className="btn-primary flex items-center justify-center gap-2">
            <Search className="h-4 w-4" />Buscar
          </button>
        </div>
      </div>

      {error && <Alert message={error} className="mb-4" />}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {loading ? 'Buscando...' : resumen}
        </h2>
      </div>

      {renderResults()}
    </div>
  );
}

function AlojamientoCard({
  item, href
}: Readonly<{
  item: AccommodationSearchItemDTO;
  href: string;
}>) {
  const destino = [item.ciudad, item.provincia].filter(Boolean).join(', ');

  return (
    <Link
      to={href}
      className="card overflow-hidden p-0 hover:shadow-lg transition-shadow group block no-underline"
    >
      <div className="h-48 bg-gradient-to-br from-navy-400 to-navy-600 relative overflow-hidden flex items-center justify-center">
        {item.imagenPrincipalUrl ? (
          <img src={item.imagenPrincipalUrl} alt={item.nombre} className="w-full h-full object-cover" />
        ) : (
          <BedDouble className="h-16 w-16 text-white/30" />
        )}
        <div className="absolute top-3 right-3 bg-white/90 rounded-lg px-2 py-1 text-xs font-bold text-navy-600">
          {item.tipoAlojamiento}
        </div>
        {item.habitacionesDisponibles > 0 && (
          <div className="absolute bottom-3 left-3 bg-green-500 text-white rounded-full px-2 py-0.5 text-xs font-semibold">
            {item.habitacionesDisponibles} disponibles
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-800 group-hover:text-navy-600 transition-colors leading-tight">
            {item.nombre}
          </h3>
          {(item.promedioValoracion ?? 0) > 0 && (
            <div className="flex items-center gap-1 text-sm font-semibold text-gold-600 ml-2 flex-shrink-0">
              <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
              {item.promedioValoracion!.toFixed(1)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin className="h-3 w-3" />
          {destino}
        </div>

        {item.descripcion && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.descripcion}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-400">desde</span>
            <p className="text-lg font-bold text-navy-600">
              ${(item.precioDesde ?? 0).toFixed(2)}
              <span className="text-xs font-normal text-gray-500"> /noche</span>
            </p>
          </div>
          <span className="btn-primary text-sm px-4 py-1.5">Ver</span>
        </div>
      </div>
    </Link>
  );
}
