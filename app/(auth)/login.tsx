import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { extractError } from '../../src/api/client';
import { Alert } from '../../src/components/ui/Alert';
import { Spinner } from '../../src/components/ui/Spinner';

const BACKOFFICE_ROLES = ['ADMINISTRADOR', 'ADMIN', 'RECEPCIONISTA', 'OPERATIVO', 'DESK_SERVICE'];

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!username || !password) { setError('Completa todos los campos.'); return; }
    setLoading(true);
    setError('');
    try {
      const userData = await login(username, password);
      if (from) { router.replace(from as any); return; }
      const isBackOffice = userData.roles.some(r => BACKOFFICE_ROLES.includes(r));
      router.replace(isBackOffice ? '/(backoffice)' : '/(cliente)/reservas');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-kairos-bg"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center px-4 py-8">
          <View className="w-full max-w-md">
            {/* Header */}
            <View className="items-center mb-8">
              <Text className="text-4xl font-bold text-navy-600">
                Hotel <Text className="text-gold-500">Kairos</Text>
              </Text>
              <Text className="text-gray-500 mt-2">Inicia sesión en tu cuenta</Text>
            </View>

            {/* Card */}
            <View className="bg-white rounded-2xl border border-kairos-border shadow-sm p-6">
              {error ? <Alert message={error} className="mb-4" /> : null}

              {/* Username */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Usuario</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1F2937', backgroundColor: 'white' }}
                  placeholder="tu_usuario"
                  placeholderTextColor="#9CA3AF"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password */}
              <View className="mb-5">
                <Text className="text-sm font-medium text-gray-700 mb-1">Contraseña</Text>
                <View className="flex-row border border-gray-300 rounded-lg bg-white items-center">
                  <TextInput
                    style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1F2937' }}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPwd}
                    autoCapitalize="none"
                  />
                  <Pressable onPress={() => setShowPwd(!showPwd)} className="px-3">
                    {showPwd
                      ? <EyeOff size={16} color="#9CA3AF" />
                      : <Eye size={16} color="#9CA3AF" />}
                  </Pressable>
                </View>
              </View>

              {/* Submit */}
              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                className={`flex-row items-center justify-center gap-2 py-2.5 rounded-lg bg-gold-500 ${loading ? 'opacity-60' : ''}`}
              >
                {loading && <Spinner size="sm" color="#fff" />}
                <Text className="text-white font-semibold text-sm">
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </Text>
              </Pressable>

              <Text className="text-center text-sm text-gray-500 mt-5">
                ¿No tienes cuenta?{' '}
                <Link href="/(auth)/register" className="text-gold-600 font-medium">
                  Regístrate
                </Link>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
