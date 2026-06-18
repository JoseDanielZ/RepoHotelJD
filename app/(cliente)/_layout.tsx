import { useEffect } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { PageSpinner } from '../../src/components/ui/Spinner';
import { ClienteDrawerContent } from '../../src/components/layout/ClienteDrawerContent';

export default function ClienteLayout() {
  const { user, loading, isBackOffice } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/(auth)/login');
    } else if (isBackOffice) {
      router.replace('/(backoffice)');
    }
  }, [loading, user, isBackOffice]);

  if (loading) return <PageSpinner />;
  if (!user) return null;

  return (
    <Drawer
      drawerContent={() => <ClienteDrawerContent />}
      screenOptions={{
        drawerType: isDesktop ? 'permanent' : 'slide',
        drawerStyle: { width: 256, backgroundColor: '#1C3361' },
        headerStyle: { backgroundColor: '#1C3361' },
        headerTintColor: '#C9A840',
        headerTitleStyle: { fontWeight: '700', color: '#fff' },
        headerTitleAlign: 'left',
      }}
    >
      <Drawer.Screen
        name="reservas/index"
        options={{ title: 'Mis Reservas', drawerLabel: 'Mis Reservas' }}
      />
      <Drawer.Screen
        name="reservas/[reservaGuid]"
        options={{ drawerItemStyle: { display: 'none' }, title: 'Detalle Reserva' }}
      />
      <Drawer.Screen
        name="facturas/index"
        options={{ title: 'Mis Facturas', drawerLabel: 'Mis Facturas' }}
      />
    </Drawer>
  );
}
