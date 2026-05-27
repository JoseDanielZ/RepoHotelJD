import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { extractError } from '../../api/client';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [nombres, setNombres] = useState('');
  const [correo, setCorreo] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nombres || !correo || !username || !password) { setError('Completa todos los campos.'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    if (password.length < 10) { setError('La contraseña debe tener al menos 10 caracteres.'); return; }

    setLoading(true);
    setError('');
    try {
      await register(username, password, nombres, correo);
      navigate('/cliente/reservas', { replace: true });
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kairos-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold text-navy-600">
            Hotel <span className="text-gold-500">Kairos</span>
          </h1>
          <p className="text-gray-500 mt-2">Crea tu cuenta de cliente</p>
        </div>

        <div className="card">
          {error && <Alert message={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="r-nombres" className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input id="r-nombres" className="input-field" type="text" placeholder="Juan Pérez" value={nombres}
                onChange={(e) => setNombres(e.target.value)} autoFocus />
            </div>

            <div>
              <label htmlFor="r-correo" className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input id="r-correo" className="input-field" type="email" placeholder="correo@ejemplo.com" value={correo}
                onChange={(e) => setCorreo(e.target.value)} />
            </div>

            <div>
              <label htmlFor="r-username" className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input id="r-username" className="input-field" type="text" placeholder="mi_usuario" value={username}
                onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div>
              <label htmlFor="r-password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input id="r-password" className="input-field" type="password" placeholder="Mínimo 10 caracteres" value={password}
                onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div>
              <label htmlFor="r-confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <input id="r-confirm" className="input-field" type="password" placeholder="Repite la contraseña" value={confirm}
                onChange={(e) => setConfirm(e.target.value)} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
              {loading && <Spinner size="sm" />}
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-gold-600 font-medium hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
