import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { PageSpinner } from '../src/components/ui/Spinner';

export default function Index() {
  const { isAuthenticated, isBackOffice, loading } = useAuth();

  if (loading) return <PageSpinner />;
  if (!isAuthenticated) return <Redirect href="/(public)" />;
  if (isBackOffice) return <Redirect href="/(backoffice)" />;
  return <Redirect href="/(cliente)/reservas" />;
}
