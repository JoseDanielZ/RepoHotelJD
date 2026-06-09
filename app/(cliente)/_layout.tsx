import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { PageSpinner } from '../../src/components/ui/Spinner';
import { CalendarCheck } from '../../src/lib/icons';

export default function ClienteLayout() {
  const { user, loading, isBackOffice } = useAuth();
  const router = useRouter();

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
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E8E2D8' },
        tabBarActiveTintColor: '#C9A840',
        tabBarInactiveTintColor: '#9CA3AF',
        headerStyle: { backgroundColor: '#1C3361' },
        headerTintColor: '#C9A840',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="reservas/index"
        options={{
          title: 'Mis Reservas',
          tabBarLabel: 'Reservas',
          tabBarIcon: ({ color, size }) => <CalendarCheck size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reservas/[reservaGuid]"
        options={{ href: null }}
      />
    </Tabs>
  );
}
