import { useEffect, useState } from 'react';
import { AppProvider, useApp } from '@/lib/AppContext';
import Layout, { type Route } from '@/components/Layout';
import Toaster from '@/components/ui/Toaster';
import Landing, { LoginPage, RegisterPage } from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import AssetsPage from '@/pages/Assets';
import WishesPage from '@/pages/Wishes';
import ContactsPage from '@/pages/Contacts';
import MemoriesPage from '@/pages/Memories';
import SummaryPage from '@/pages/Summary';
import LegacyAccessPage from '@/pages/LegacyAccess';
import AdminPage from '@/pages/Admin';

const PUBLIC_ROUTES: Route[] = ['landing', 'register', 'login'];

function Router() {
  const { currentUser } = useApp();
  const [route, setRoute] = useState<Route>(() => (currentUser ? 'dashboard' : 'landing'));

  // Sync hash for shareable demo links (e.g. legacy access for a contact)
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace('#/', '').replace('#', '') as Route;
      if (h && ['landing', 'register', 'login', 'dashboard', 'assets', 'wishes', 'contacts', 'memories', 'summary', 'legacy-access', 'admin'].includes(h)) {
        setRoute(h);
      }
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  const navigate = (r: Route) => {
    setRoute(r);
    window.location.hash = `/${r}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Guard: private pages require a logged-in user (admin page handled separately)
  useEffect(() => {
    if (!currentUser && !PUBLIC_ROUTES.includes(route) && route !== 'admin' && route !== 'legacy-access') {
      navigate('login');
    }
  }, [currentUser, route]);

  // Public pages render standalone (no app shell)
  if (route === 'landing') return <Landing onNavigate={(r) => navigate(r)} />;
  if (route === 'register') return <RegisterPage onNavigate={(r) => navigate(r)} onSuccess={() => navigate('dashboard')} />;
  if (route === 'login') return <LoginPage onNavigate={(r) => navigate(r)} onSuccess={() => navigate('dashboard')} />;

  // Legacy access & admin can be viewed without a user session
  if (route === 'admin') return <Layout route={route} onNavigate={navigate}><AdminPage /></Layout>;
  if (route === 'legacy-access') return <Layout route={route} onNavigate={navigate}><LegacyAccessPage /></Layout>;

  // Private pages: require user
  if (!currentUser) {
    return <LoginPage onNavigate={(r) => navigate(r)} onSuccess={() => navigate('dashboard')} />;
  }

  const page = (() => {
    switch (route) {
      case 'dashboard': return <Dashboard onNavigate={navigate} />;
      case 'assets': return <AssetsPage />;
      case 'wishes': return <WishesPage />;
      case 'contacts': return <ContactsPage />;
      case 'memories': return <MemoriesPage />;
      case 'summary': return <SummaryPage />;
      default: return <Dashboard onNavigate={navigate} />;
    }
  })();

  return <Layout route={route} onNavigate={navigate}>{page}</Layout>;
}

export default function App() {
  return (
    <AppProvider>
      <Router />
      <Toaster />
    </AppProvider>
  );
}
