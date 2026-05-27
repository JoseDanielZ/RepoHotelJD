import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Star, ChevronRight } from 'lucide-react';

const highlights = [
  { icon: '🏊', title: 'Piscina Infinity', desc: 'Con vista panorámica al mar' },
  { icon: '🍽️', title: 'Restaurante Gourmet', desc: 'Cocina local e internacional' },
  { icon: '💆', title: 'Spa & Wellness', desc: 'Tratamientos de relajación' },
  { icon: '🎾', title: 'Actividades', desc: 'Tenis, golf y más deporte' },
];

const testimonials = [
  { name: 'María García', rating: 5, text: 'Una experiencia increíble. El servicio fue impecable y las instalaciones de lujo.', date: '2026-04-15' },
  { name: 'Carlos Mendoza', rating: 5, text: 'El mejor hotel en el que he estado. Habitaciones amplias y una vista espectacular.', date: '2026-03-22' },
  { name: 'Ana Rodríguez', rating: 4, text: 'Muy buen hotel, la atención del personal es excelente. Totalmente recomendable.', date: '2026-02-10' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [destino, setDestino] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [adultos, setAdultos] = useState(2);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destino) params.set('Destino', destino);
    if (fechaInicio) params.set('fechaInicio', fechaInicio);
    if (fechaFin) params.set('fechaFin', fechaFin);
    if (adultos > 0) params.set('NumAdultos', String(adultos));
    navigate(`/search?${params.toString()}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[600px] flex items-center"
        style={{
          background: 'linear-gradient(135deg, #1C3361 0%, #2d5fb8 50%, #1C3361 100%)',
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-navy-600/90 to-navy-600/60" />
          {/* Abstract pattern */}
          <div className="absolute right-0 top-0 h-full w-1/2 opacity-10">
            <div className="h-full w-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A840' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-400/30 rounded-full px-4 py-1.5 text-gold-300 text-sm font-medium mb-6">
              <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
              Calidad 5 estrellas garantizada
            </div>
            <h1 className="font-serif text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Tu descanso<br />
              <span className="text-gold-400">comienza aquí</span>
            </h1>
            <p className="text-lg text-navy-200 mb-10 leading-relaxed">
              Descubre la experiencia única del Hotel Kairos. Lujo, confort y servicio excepcional
              en los destinos más exclusivos.
            </p>
          </div>

          {/* Search box */}
          <div className="bg-white rounded-2xl shadow-2xl p-5 max-w-5xl">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  <MapPin className="h-3 w-3 inline mr-1" />Destino
                </label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="¿A dónde vas?"
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  <Calendar className="h-3 w-3 inline mr-1" />Llegada
                </label>
                <input
                  className="input-field"
                  type="date"
                  min={today}
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  <Calendar className="h-3 w-3 inline mr-1" />Salida
                </label>
                <input
                  className="input-field"
                  type="date"
                  min={fechaInicio || today}
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  <Users className="h-3 w-3 inline mr-1" />Huéspedes
                </label>
                <div className="flex gap-2">
                  <select
                    className="input-field flex-1"
                    value={adultos}
                    onChange={(e) => setAdultos(Number(e.target.value))}
                  >
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} adulto{n > 1 ? 's' : ''}</option>)}
                  </select>
                  <button type="submit" className="btn-primary px-4 flex-shrink-0">
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-bold text-navy-600 mb-3">Experiencias únicas</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Descubre todo lo que Hotel Kairos tiene para ofrecerte</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {highlights.map((h) => (
            <div key={h.title} className="card text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">{h.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{h.title}</h3>
              <p className="text-sm text-gray-500">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-navy-600 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-white mb-3">Lo que dicen nuestros huéspedes</h2>
            <p className="text-navy-300">Opiniones verificadas de viajeros reales</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white/10 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < t.rating ? 'fill-gold-400 text-gold-400' : 'text-navy-400'}`} />
                  ))}
                </div>
                <p className="text-navy-100 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white text-sm">{t.name}</span>
                  <span className="text-xs text-navy-400">{new Date(t.date).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="font-serif text-3xl font-bold text-navy-600 mb-4">¿Listo para reservar?</h2>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
          Descubre nuestras suites y habitaciones disponibles para tu próxima estadía.
        </p>
        <button
          onClick={() => navigate('/search')}
          className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2"
        >
          Ver disponibilidad <ChevronRight className="h-4 w-4" />
        </button>
      </section>
    </div>
  );
}
