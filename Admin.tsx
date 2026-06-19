import { useState, useEffect } from 'react';
import type { Dish, Order, DiscountCodes, Settings } from './types';
import { LS, translations, DEFAULT_DISHES } from './utils';
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
  const [dishes, setDishes] = useState<Dish[]>(() => LS.get('ck_dishes', DEFAULT_DISHES));
  const [allOrders, setAllOrders] = useState<Order[]>(() => LS.get('ck_all_orders', []));
  const [discountCodes, setDiscountCodes] = useState<DiscountCodes>(() => LS.get('ck_discounts', {}));
  const [settings, setSettings] = useState<Settings>(() =>
    LS.get('ck_settings', { loaderBg: '', storyImg: '' })
  );
  const t = translations;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const phone = LS.get('ck_currentUser') as string | null;
    if (phone) {
      const users = LS.get('ck_users', {}) as Record<string, { name: string }>;
      const user = users[phone];
      if (user) {
        setUserId(phone);
        setUserName(user.name);
        setAuthenticated(true);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { LS.set('ck_dishes', dishes); }, [dishes]);
  useEffect(() => { LS.set('ck_all_orders', allOrders); }, [allOrders]);
  useEffect(() => { LS.set('ck_discounts', discountCodes); }, [discountCodes]);
  useEffect(() => { LS.set('ck_settings', settings); }, [settings]);

  const handleSkip = () => {
    setAuthenticated(true);
    setUserName('Guest');
    setUserId(null);
    setLoginRequested(false);
  };
  const handleLogin = () => {
    const phone = LS.get('ck_currentUser') as string | null;
    if (phone) {
      const users = LS.get('ck_users', {}) as Record<string, { name: string }>;
      const user = users[phone];
      if (user) {
        setUserId(phone);
        setUserName(user.name);
        setAuthenticated(true);
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
