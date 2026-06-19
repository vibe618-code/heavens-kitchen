import { useState, useEffect } from 'react';
import type { Dish, Order, DiscountCodes, Settings } from './types';
import { LS, translations, DEFAULT_DISHES } from './utils';
import { fetchDishes, fetchAllOrders, fetchUser, fetchDiscountCodes, fetchSettings } from './lib/db';
import { LoadingScreen, AuthScreen } from './components/UIComponents';
import { AdminPanel } from './components/Admin';
import MainApp from './components/MainApp';

export default function App() {
  const [darkMode, setDarkMode] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userName, setUserName] = useState('Guest');
  const [userId, setUserId] = useState<string | null>(null);
  const [loginRequested, setLoginRequested] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCodes>({});
  const [settings, setSettings] = useState<Settings>({ loaderBg: '', storyImg: '' });
  const t = translations;

  // ---- Dark Mode ----
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // ---- Load data from Supabase (or localStorage fallback) ----
  useEffect(() => {
    async function loadData() {
      const [dishesData, ordersData, codesData, settingsData] = await Promise.all([
        fetchDishes(),
        fetchAllOrders(),
        fetchDiscountCodes(),
        fetchSettings(),
      ]);
      setDishes(dishesData.length > 0 ? dishesData : DEFAULT_DISHES);
      setAllOrders(ordersData);
      setDiscountCodes(codesData);
      setSettings(settingsData);

    }

    const phone = LS.get('ck_currentUser') as string | null;
    if (phone) {
      // Try Supabase first, then localStorage
      fetchUser(phone).then((supaUser) => {
        if (supaUser) {
          setUserId(phone);
          setUserName((supaUser.name as string) || 'Guest');
          setAuthenticated(true);
        } else {
          // Fallback to localStorage
          const users = LS.get('ck_users', {}) as Record<string, { name: string }>;
          const localUser = users[phone];
          if (localUser) {
            setUserId(phone);
            setUserName(localUser.name);
            setAuthenticated(true);
          }
        }
        loadData().finally(() => setLoading(false));
      });
    } else {
      loadData().finally(() => setLoading(false));
    }
  }, []);

  // ---- Auth handlers ----
  const handleSkip = () => {
    setAuthenticated(true);
    setUserName('Guest');
    setUserId(null);
    setLoginRequested(false);
  };

  const handleLogin = async () => {
    const phone = LS.get('ck_currentUser') as string | null;
    if (phone) {
      const supaUser = await fetchUser(phone);
      if (supaUser) {
        setUserId(phone);
        setUserName((supaUser.name as string) || 'Guest');
        setAuthenticated(true);
      } else {
        const users = LS.get('ck_users', {}) as Record<string, { name: string }>;
        const localUser = users[phone];
        if (localUser) {
          setUserId(phone);
          setUserName(localUser.name);
          setAuthenticated(true);
        }
      }
    }
    setLoginRequested(false);
  };

  const requestLogin = () => setLoginRequested(true);

  const handleSignOut = () => {
    LS.remove('ck_currentUser');
    setAuthenticated(false);
    setUserName('Guest');
    setUserId(null);
  };

  // ---- Render ----
  if (loading) {
    return (
      <LoadingScreen
        t={t}
        onComplete={() => setLoading(false)}
        bgImage={settings.loaderBg}
      />
    );
  }

  if (adminOpen) {
    return (
      <AdminPanel
        dishes={dishes}
        setDishes={setDishes}
        orders={allOrders}
        setOrders={setAllOrders}
        discountCodes={discountCodes}
        setDiscountCodes={setDiscountCodes}
        settings={settings}
        setSettings={setSettings}
        onCloseAdmin={() => setAdminOpen(false)}
      />
    );
  }

  if (loginRequested || !authenticated) {
    return (
      <AuthScreen
        t={t}
        onLogin={handleLogin}
        onSkip={handleSkip}
        setUserName={setUserName}
      />
    );
  }

  return (
    <MainApp
      t={t}
      darkMode={darkMode}
      toggleDarkMode={() => setDarkMode(!darkMode)}
      onSignOut={handleSignOut}
      requestLogin={requestLogin}
      weatherGreeting=""
      userName={userName}
      userId={userId}
      dishes={dishes}
      setAllOrders={setAllOrders}
      discountCodes={discountCodes}
      onAdminClick={() => setAdminOpen(true)}
      settings={settings}
    />
  );
}
