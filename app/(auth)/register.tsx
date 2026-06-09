import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { extractError } from '../../src/api/client';
import { Alert } from '../../src/components/ui/Alert';
import { Spinner } from '../../src/components/ui/Spinner';

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();

  const [nombres, setNombres] = useState('');
  const [correo, setCorreo] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!nombres || !correo || !username || !password) { setError('Completa todos los campos.'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    if (password.length < 10) { setError('La contraseña debe tener al menos 10 caracteres.'); return; }
    setLoading(true);
    setError('');
    try {
      const userData = await register(username, password, nombres, correo);
      const isBackOffice = userData.roles.some(r => ['ADMINISTRADOR', 'ADMIN', 'RECEPCIONISTA', 'OPERATIVO', 'DESK_SERVICE'].includes(r));
      router.replace(isBackOffice ? '/(backoffice)' : '/(cliente)/reservas');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, value, onChangeText, placeholder, secure = false }: {
    label: string; value: string; onChangeText: (v: string) => void;
    placeholder: string; secure?: boolean;
  }) => (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={label === 'Correo electrónico' ? 'email-address' : 'default'}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-kairos-bg"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center justify-center px-4 py-8">
          <View className="w-full max-w-md">
            <View className="items-center mb-8">
              <Text className="text-4xl font-bold text-navy-600">
                Hotel <Text className="text-gold-500">Kairos</Text>
              </Text>
              <Text className="text-gray-500 mt-2">Crea tu cuenta de cliente</Text>
            </View>

            <View className="bg-white rounded-2xl border border-kairos-border shadow-sm p-6">
              {error ? <Alert message={error} className="mb-4" /> : null}

              <Field label="Nombre completo" value={nombres} onChangeText={setNombres} placeholder="Juan Pérez" />
              <Field label="Correo electrónico" value={correo} onChangeText={setCorreo} placeholder="correo@ejemplo.com" />
              <Field label="Usuario" value={username} onChangeText={setUsername} placeholder="mi_usuario" />
              <Field label="Contraseña" value={password} onChangeText={setPassword} placeholder="Mínimo 10 caracteres" secure />
              <Field label="Confirmar contraseña" value={confirm} onChangeText={setConfirm} placeholder="Repite la contraseña" secure />

              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                className={`flex-row items-center justify-center gap-2 py-2.5 rounded-lg bg-gold-500 mt-1 ${loading ? 'opacity-60' : ''}`}
              >
                {loading && <Spinner size="sm" color="#fff" />}
                <Text className="text-white font-semibold text-sm">
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </Text>
              </Pressable>

              <Text className="text-center text-sm text-gray-500 mt-5">
                ¿Ya tienes cuenta?{' '}
                <Link href="/(auth)/login" className="text-gold-600 font-medium">
                  Inicia sesión
                </Link>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
