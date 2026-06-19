import { useState, useEffect } from 'react';
import type { Translations, CartItem, Toast } from '../types';
import { useSparkles, useFloatingItems } from '../utils';
import { fetchUser, saveUser } from '../lib/db';

// ---- Cursor ----
export const Cursor = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);
  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const over = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest('a,button,[role=button],input,select')) setHover(true);
    };
    const out = () => setHover(false);
    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
    };
  }, []);
  return (
    <div
      className={`custom-cursor ${hover ? 'hover' : ''}`}
      style={{ left: pos.x + 'px', top: pos.y + 'px' }}
    />
  );
};

// ---- SparkleField ----
export const SparkleField = () => {
  const sparkles = useSparkles(45);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="sparkle-dot"
          style={{
            left: s.left + '%',
            top: s.top + '%',
            width: s.size + 'px',
            height: s.size + 'px',
            animationDelay: s.delay + 's',
            animationDuration: s.duration + 's',
          }}
        />
      ))}
    </div>
  );
};

// ---- LoadingScreen ----
export const LoadingScreen = ({
  t,
  onComplete,
  bgImage,
}: {
  t: Translations;
  onComplete: () => void;
  bgImage?: string;
}) => {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setHidden(true);
      setTimeout(onComplete, 550);
    }, 1700);
    return () => clearTimeout(timer);
  }, [onComplete]);
  return (
    <div
      className={`loading-screen ${hidden ? 'hidden' : ''}`}
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative z-10 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-cream mb-6">
          {t.loading}
          <span className="text-red-velvet">.</span>
        </h1>
        <div className="flex gap-2 justify-center">
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
        </div>
      </div>
    </div>
  );
};

// ---- AuthScreen ----
export const AuthScreen = ({
  t,
  onLogin,
  onSkip,
  setUserName,
}: {
  t: Translations;
  onLogin: () => void;
  onSkip: () => void;
  setUserName: (n: string) => void;
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({ phone: '', password: '', name: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const phoneRegex = /^[+]?[0-9]{10,13}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phoneRegex.test(form.phone.replace(/[\s-]/g, ''))) {
      setError('Please enter a valid phone number.');
      return;
    }
    setLoading(true);

    if (mode === 'signup') {
      // Check if user exists in Supabase
      const existing = await fetchUser(form.phone);
      if (existing) {
        setError('Phone already registered.');
        setLoading(false);
        return;
      }
      // Check localStorage too
      const users = JSON.parse(localStorage.getItem('ck_users') || '{}');
      if (users[form.phone]) {
        setError('Phone already registered.');
        setLoading(false);
        return;
      }

      const newUser = {
        phone: form.phone,
        password: form.password,
        name: form.name,
        address: form.address,
        loyalty_coins: 0,
      };
      // Save to Supabase
      await saveUser(newUser);
      // Also save locally as backup
      users[form.phone] = newUser;
      localStorage.setItem('ck_users', JSON.stringify(users));
      localStorage.setItem('ck_currentUser', JSON.stringify(form.phone));
      setUserName(form.name);
    } else {
      // Login: try Supabase first
      const supaUser = await fetchUser(form.phone);
      if (supaUser && supaUser.password === form.password) {
        localStorage.setItem('ck_currentUser', JSON.stringify(form.phone));
        setUserName((supaUser.name as string) || 'User');
        setLoading(false);
        onLogin();
        return;
      }
      // Fallback to localStorage
      const users = JSON.parse(localStorage.getItem('ck_users') || '{}');
      const user = users[form.phone];
      if (!user || user.password !== form.password) {
        setError('Invalid phone or password.');
        setLoading(false);
        return;
      }
      localStorage.setItem('ck_currentUser', JSON.stringify(form.phone));
      setUserName(user.name);
    }
    setLoading(false);
    onLogin();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 matte-glossy-bg"></div>
      <SparkleField />
      <div className="relative z-10 glass-card rounded-3xl p-8 md:p-10 w-full max-w-md animate-scale-in shadow-2xl">
        <h2 className="font-display text-3xl font-bold text-dark-chocolate dark:text-cream text-center mb-6">
          {t.loginWelcome}
          <span className="text-red-velvet">.</span>
        </h2>
        {error && (
          <div className="bg-error/20 text-error p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold">{t.phone}</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-dark-chocolate/60 border"
              placeholder="+91 98765 43210"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold">{t.password}</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-dark-chocolate/60 border"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-bold">{t.name}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-dark-chocolate/60 border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold">{t.address}</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-dark-chocolate/60 border"
                  required
                />
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-semibold shadow-lg transition active:scale-95 ${
              loading
                ? 'bg-gray-400 cursor-wait'
                : 'bg-velvet-red text-white hover:bg-red-velvet'
            }`}
          >
            {loading ? 'Processing...' : mode === 'login' ? t.login : t.signup}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
            className="text-sm text-dark-chocolate/70 dark:text-cream/70 hover:underline"
          >
            {mode === 'login' ? t.noAccount : t.hasAccount}
          </button>
        </div>
        <div className="mt-6 text-center">
          <button onClick={onSkip} className="text-sm text-dark-chocolate/50 dark:text-cream/50 hover:underline">
            {t.skip}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- FloatingItems ----
export const FloatingItems = () => {
  const items = useFloatingItems();
  return (
    <>
      {items.map((item, idx) => (
        <div
          key={idx}
          className="floating-item"
          style={{ left: item.left, animationDelay: item.delay, animationDuration: item.duration }}
        >
          <i className={`fas ${item.icon}`}></i>
        </div>
      ))}
    </>
  );
};

// ---- ToastContainer ----
export const ToastContainer = ({ toasts }: { toasts: Toast[] }) => (
  <div className="fixed bottom-24 left-4 z-50 space-y-2">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className="bg-velvet-red text-white px-4 py-2 rounded-full shadow-lg animate-slide-up text-sm cart-hd-text"
      >
        {toast.msg}
      </div>
    ))}
  </div>
);

// ---- SkeletonCard ----
export const SkeletonCard = () => (
  <div className="masonry-item rounded-2xl overflow-hidden shadow-lg">
    <div className="skeleton-box h-56 w-full"></div>
    <div className="menu-item-bar p-4 space-y-2">
      <div className="skeleton-box h-5 w-3/4 rounded"></div>
      <div className="skeleton-box h-4 w-1/4 rounded"></div>
    </div>
  </div>
);

// ---- AnimatedCheckmark ----
export const AnimatedCheckmark = () => (
  <svg className="w-24 h-24" viewBox="0 0 52 52">
    <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" stroke="#3C6E47" strokeWidth="3" />
    <path
      className="checkmark-check"
      fill="none"
      stroke="#3C6E47"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14 27l7 7 16-16"
    />
  </svg>
);

// ---- QuantityStepper ----
export const QuantityStepper = ({
  qty,
  onIncrement,
  onDecrement,
}: {
  qty: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) => (
  <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 rounded-full px-2 py-1 border">
    <button
      onClick={onDecrement}
      disabled={qty <= 1}
      className="w-7 h-7 flex items-center justify-center rounded-full font-bold text-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
    >
      −
    </button>
    <span className="w-8 text-center font-semibold text-sm">{qty}</span>
    <button
      onClick={onIncrement}
      className="w-7 h-7 flex items-center justify-center rounded-full font-bold text-lg hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      +
    </button>
  </div>
);

// ---- CartItemRow ----
export const CartItemRow = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  item: CartItem;
  onIncrement: (sku: number | string, c: string) => void;
  onDecrement: (sku: number | string, c: string) => void;
  onRemove: (sku: number | string, c: string) => void;
}) => (
  <div className="bg-white/60 dark:bg-dark-chocolate/60 rounded-2xl p-4 flex items-center gap-3 border">
    <img src={item.image} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" alt={item.name} loading="lazy" />
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm truncate cart-hd-text">{item.name}</p>
      <p className="text-xs">₹{item.unitPrice} each</p>
      {item.customizations && item.customizations !== 'Standard' && (
        <p className="text-xs text-amber-600">{item.customizations}</p>
      )}
    </div>
    <QuantityStepper
      qty={item.qty}
      onIncrement={() => onIncrement(item.sku, item.customizations)}
      onDecrement={() => onDecrement(item.sku, item.customizations)}
    />
    <span className="font-semibold text-sm w-16 text-right">
      ₹{(item.unitPrice * item.qty).toFixed(2)}
    </span>
    <button
      onClick={() => onRemove(item.sku, item.customizations)}
      className="text-error text-lg"
    >
      <i className="fas fa-trash-alt"></i>
    </button>
  </div>
);
