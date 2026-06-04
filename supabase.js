<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Heaven's Kitchen – Animated Popup Menu</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            base: 'var(--color-base)',
            surface: 'var(--color-surface)',
            elevated: 'var(--color-elevated)',
            'text-primary': 'var(--color-text-primary)',
            'text-secondary': 'var(--color-text-secondary)',
            'accent-primary': 'var(--color-accent-primary)',
            'accent-secondary': 'var(--color-accent-secondary)',
            success: '#648813',
            error: '#a90409',
            border: 'var(--color-border)',
          },
          fontFamily: {
            musaic: ['MUSAIC - BROOVY KETRO', 'Bebas Neue', 'sans-serif'],
            secret: ['The Secret Regular', 'Dancing Script', 'cursive'],
          },
          boxShadow: {
            glow: '0 0 12px rgba(184,124,74,0.5)',
          },
        },
      },
    };
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Dancing+Script:wght@400;600&family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <style>
    /* custom fonts & animations */
    @font-face {
      font-family: 'The Secret Regular';
      src: local('Dancing Script'), url('https://fonts.gstatic.com/s/dancingscript/v24/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7BMSo3Rep8ltA.woff2') format('woff2');
    }
    @font-face {
      font-family: 'MUSAIC - BROOVY KETRO';
      src: local('Bebas Neue'), url('https://fonts.gstatic.com/s/bebasneue/v14/JTUSjIg69CK48gW7PXooxW5rygbi49c.woff2') format('woff2');
    }
    :root {
      --color-base: #ede5cc;
      --color-surface: #f5f0e2;
      --color-elevated: #ffffff;
      --color-text-primary: #2c2418;
      --color-text-secondary: #6b5e4a;
      --color-border: #d8cfa8;
      --color-accent-primary: #a90409;
      --color-accent-secondary: #b87c4a;
      --gradient-start: #faf3df;
      --gradient-end: #ede5cc;
    }
    .dark {
      --color-base: #1f1c14;
      --color-surface: #2a261d;
      --color-elevated: #343023;
      --color-text-primary: #f0ead9;
      --color-text-secondary: #c9bd97;
      --color-border: #534c38;
      --color-accent-primary: #c7050a;
      --color-accent-secondary: #d99c65;
    }
    body {
      margin: 0;
      font-family: 'MUSAIC - BROOVY KETRO', 'Bebas Neue', sans-serif;
      background: var(--color-base);
      color: var(--color-text-primary);
      overflow-x: hidden;
    }
    /* animated background */
    .bg-animated {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -2;
      background: radial-gradient(circle at 10% 20%, var(--gradient-start), var(--gradient-end));
    }
    /* modal animation */
    .modal-enter {
      animation: modalZoomIn 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
    }
    @keyframes modalZoomIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    .backdrop-enter {
      animation: fadeIn 0.2s ease forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    /* toast animation */
    .toast-enter {
      animation: slideRight 0.3s ease forwards;
    }
    @keyframes slideRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    /* drawer animation */
    .drawer-enter {
      animation: slideLeft 0.3s ease forwards;
    }
    @keyframes slideLeft {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
    /* button effects */
    .btn-ripple {
      position: relative;
      overflow: hidden;
      transition: transform 0.1s, box-shadow 0.2s;
    }
    .btn-ripple:active {
      transform: scale(0.96);
    }
    .btn-ripple::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255,255,255,0.5);
      transform: translate(-50%, -50%);
      transition: width 0.3s, height 0.3s, opacity 0.3s;
      opacity: 0;
      pointer-events: none;
    }
    .btn-ripple:active::after {
      width: 200px;
      height: 200px;
      opacity: 0.6;
    }
    .menu-card {
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    }
    .menu-card:hover {
      transform: translateY(-6px) scale(1.02);
      box-shadow: 0 20px 25px -12px rgba(0,0,0,0.2), 0 0 0 1px var(--color-accent-secondary);
    }
    .fade-up {
      animation: fadeUp 0.5s ease backwards;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .category-btn {
      transition: all 0.2s;
    }
    .category-btn:active {
      transform: scale(0.94);
    }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
  </style>
</head>
<body>
<div id="root"></div>
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel">
  const { useState, useEffect, useCallback } = React;

  // ========== SUPABASE CONFIG (REPLACE WITH YOUR KEYS) ==========
  const SUPABASE_URL = "https://your-project.supabase.co";   // CHANGE THIS
  const SUPABASE_ANON_KEY = "your-anon-key";                 // CHANGE THIS
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ========== FALLBACK MENU (FULL DATA) ==========
  const fallbackMenu = [
    { sku: 'HSP-CLF', name: 'Chicken Loaded Fries', price: 160, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop', category: "Heaven's Special", inStock: true, popular: true },
    { sku: 'BGR-CZB', name: 'Chicken Zinger Burger', price: 130, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', category: 'Burger', inStock: true },
    { sku: 'PIZ-CCP8', name: 'Cheesy Chicken Pizza 8"', price: 230, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', category: 'Pizza', inStock: true, popular: true },
    // ... add all your items (full list from previous version)
  ];

  // ========== TOAST CONTEXT ==========
  const ToastContext = React.createContext();
  function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const addToast = useCallback((msg, type='info') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, msg, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
    }, []);
    return (
      <ToastContext.Provider value={{ addToast }}>
        {children}
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
          {toasts.map(t => (
            <div key={t.id} className={`toast-enter bg-elevated border-l-4 ${t.type === 'error' ? 'border-error' : 'border-success'} shadow-lg p-3 rounded max-w-xs`}>
              {t.msg}
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    );
  }
  function useToast() { return React.useContext(ToastContext); }

  // ========== AUTH PAGE ==========
  function AuthPage({ onAuthSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      try {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          const { error: profileError } = await supabase.from('profiles').insert([{ id: data.user.id, name, phone, address, loyalty_points: 480 }]);
          if (profileError) throw profileError;
          onAuthSuccess(data.user);
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          onAuthSuccess({ ...data.user, profile });
        }
      } catch (err) {
        setError(err.message);
      } finally { setLoading(false); }
    };

    return (
      <div className="min-h-screen bg-base flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-elevated rounded-card p-6 shadow-xl">
          <h1 className="font-secret text-5xl text-center text-accent-primary mb-4">Heaven's Kitchen</h1>
          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <input type="text" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 rounded bg-surface border border-border" required />
                <input type="tel" placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full p-3 rounded bg-surface border border-border" required />
                <textarea placeholder="Address" value={address} onChange={e=>setAddress(e.target.value)} className="w-full p-3 rounded bg-surface border border-border" rows="2" required />
              </>
            )}
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 rounded bg-surface border border-border" required />
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 rounded bg-surface border border-border" required />
            <button type="submit" disabled={loading} className="w-full bg-accent-primary text-white py-3 rounded btn-ripple">
              {loading ? 'Please wait...' : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
            </button>
          </form>
          <p className="text-center mt-4 text-sm">
            {isSignUp ? 'Already have an account?' : 'New here?'}
            <button onClick={() => setIsSignUp(!isSignUp)} className="ml-2 text-accent-primary font-semibold">{isSignUp ? 'Sign In' : 'Sign Up'}</button>
          </p>
        </div>
      </div>
    );
  }

  // ========== MODAL COMPONENT (POPUP ANIMATION) ==========
  function ProductModal({ product, onClose, onAddToCart }) {
    const [qty, setQty] = useState(1);
    if (!product) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-enter" onClick={onClose}></div>
        <div className="bg-elevated rounded-card max-w-sm w-full modal-enter shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
          <img src={product.image} className="w-full h-48 object-cover" />
          <div className="p-5">
            <h3 className="font-musaic text-2xl">{product.name}</h3>
            <p className="text-accent-primary text-xl mt-1">₹{product.price}</p>
            <div className="flex items-center gap-4 mt-4">
              <span className="text-text-secondary">Quantity</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty(Math.max(1, qty-1))} className="w-8 h-8 rounded-full bg-surface text-xl btn-ripple">−</button>
                <span className="w-8 text-center font-bold">{qty}</span>
                <button onClick={() => setQty(qty+1)} className="w-8 h-8 rounded-full bg-surface text-xl btn-ripple">+</button>
              </div>
            </div>
            <button onClick={() => { onAddToCart(product, qty); onClose(); }} className="w-full mt-6 bg-accent-primary text-white py-2 rounded btn-ripple">Add to Cart</button>
          </div>
        </div>
      </div>
    );
  }

  // ========== MAIN APP ==========
  function App() {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) fetchProfile(session.user.id);
        setLoading(false);
      });
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session?.user) fetchProfile(session.user.id);
        else setProfile(null);
      });
      return () => listener?.subscription.unsubscribe();
    }, []);
    async function fetchProfile(userId) {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      setProfile(data);
    }
    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!session) return <AuthPage onAuthSuccess={(user) => { setSession(user); fetchProfile(user.id); }} />;
    return (
      <ToastProvider>
        <MainApp session={session} profile={profile} />
      </ToastProvider>
    );
  }

  function MainApp({ session, profile }) {
    const { addToast } = useToast();
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState([]);
    const [view, setView] = useState('home');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [fulfillmentMode, setFulfillmentMode] = useState('delivery');
    const [selectedAddressId, setSelectedAddressId] = useState('addr1');
    const [loyaltyPoints, setLoyaltyPoints] = useState(profile?.loyalty_points || 480);
    const [redeemedPoints, setRedeemedPoints] = useState(0);
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [loadingMenu, setLoadingMenu] = useState(true);

    // Load menu from Supabase or fallback
    useEffect(() => {
      async function loadMenu() {
        const { data, error } = await supabase.from('menu').select('*');
        if (error || !data || data.length === 0) {
          console.warn("Using fallback menu");
          setMenu(fallbackMenu);
        } else {
          setMenu(data);
        }
        setLoadingMenu(false);
      }
      loadMenu();
    }, []);

    useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);

    const addToCart = (product, qty = 1) => {
      if (!product.inStock) { addToast(`${product.name} sold out`, 'error'); return; }
      setCart(prev => {
        const exist = prev.find(i => i.sku === product.sku);
        if (exist) return prev.map(i => i.sku === product.sku ? { ...i, qty: i.qty + qty } : i);
        return [...prev, { ...product, qty }];
      });
      addToast(`${product.name} added to cart`, 'success');
    };

    const incrementItem = (sku) => setCart(prev => prev.map(i => i.sku === sku ? { ...i, qty: i.qty + 1 } : i));
    const decrementItem = (sku) => setCart(prev => { const item = prev.find(i => i.sku === sku); if (item.qty === 1) return prev.filter(i => i.sku !== sku); return prev.map(i => i.sku === sku ? { ...i, qty: i.qty - 1 } : i); });
    const removeItem = (sku) => setCart(prev => prev.filter(i => i.sku !== sku));
    const cartTotal = cart.reduce((s,i) => s + i.price * i.qty, 0);
    const deliveryFee = fulfillmentMode === 'delivery' ? 40 : 0;
    const tax = Math.round((cartTotal + deliveryFee + 15) * 0.05);
    const grandTotal = cartTotal + deliveryFee + 15 + tax - Math.floor(redeemedPoints / 100) * 10;
    const placeOrder = () => {
      if (cart.length === 0) { addToast("Cart empty", 'error'); return; }
      addToast(`Order placed! Total ₹${grandTotal}`, 'success');
      setCart([]);
      setView('home');
      setLoyaltyPoints(prev => prev - redeemedPoints + Math.floor(grandTotal / 10));
      setRedeemedPoints(0);
    };

    const savedAddresses = [
      { id: 'addr1', label: 'Home', address: '123 MG Road, Bangalore', eta: '25-35 min' },
      { id: 'addr2', label: 'Work', address: '456 Koramangala, Bangalore', eta: '30-40 min' },
    ];
    const categories = [...new Set(menu.map(i => i.category))];
    const [activeCat, setActiveCat] = useState(categories[0]);
    const freshEvents = [
      { message: '🔥 Fresh Chicken Loaded Fries just prepared!' },
      { message: '🍔 Zinger Burgers are hot & ready' },
      { message: '🍕 Cheesy Chicken Pizza out of the oven' },
    ];
    const [tickerIdx, setTickerIdx] = useState(0);
    useEffect(() => { const iv = setInterval(() => setTickerIdx(i => (i+1)%freshEvents.length), 4000); return () => clearInterval(iv); }, []);

    if (loadingMenu) return <div className="text-center py-20">Loading menu...</div>;

    return (
      <div className="min-h-screen bg-base relative">
        <div className="bg-animated"></div>
        {/* Drawer */}
        {drawerOpen && (
          <>
            <div className="fixed inset-0 bg-black/60 backdrop-enter z-40" onClick={() => setDrawerOpen(false)}></div>
            <div className="fixed top-0 left-0 h-full w-72 bg-[var(--drawer-bg)] z-50 shadow-xl drawer-enter flex flex-col">
              <button onClick={() => setDrawerOpen(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface text-xl btn-ripple">✕</button>
              <div className="p-6 flex-1">
                <h2 className="font-secret text-3xl text-accent-primary mb-8">Heaven's</h2>
                <div className="space-y-3">
                  <button onClick={() => { setView('home'); setDrawerOpen(false); }} className="w-full text-left p-3 rounded hover:bg-surface btn-ripple">⌘ MENU</button>
                  <button onClick={() => { addToast("Coming soon", 'info'); setDrawerOpen(false); }} className="w-full text-left p-3 rounded hover:bg-surface btn-ripple">⊠ MY ORDERS</button>
                  <button onClick={() => { addToast("Coming soon", 'info'); setDrawerOpen(false); }} className="w-full text-left p-3 rounded hover:bg-surface btn-ripple">♥ FAVOURITES</button>
                  <button onClick={() => { setAddressModalOpen(true); setDrawerOpen(false); }} className="w-full text-left p-3 rounded hover:bg-surface btn-ripple">⌖ ADDRESSES</button>
                </div>
              </div>
              <div className="p-6 border-t border-border">
                <button onClick={() => setDarkMode(!darkMode)} className="w-full flex justify-between p-3 rounded bg-surface btn-ripple">{darkMode ? '☀️ Light mode' : '🌙 Dark mode'}</button>
                <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="w-full mt-3 p-3 rounded text-error hover:bg-surface btn-ripple">⌧ SIGN OUT</button>
                <p className="text-xs text-center mt-4">🏆 {loyaltyPoints} pts</p>
              </div>
            </div>
          </>
        )}
        {/* Header */}
        <header className="sticky top-0 z-10 bg-elevated/80 backdrop-blur-md border-b border-border px-4 py-3">
          <div className="max-w-lg mx-auto flex justify-between items-center">
            <button onClick={() => setDrawerOpen(true)} className="p-2 btn-ripple">☰</button>
            <h1 className="font-secret text-4xl text-accent-primary">Heaven's Kitchen</h1>
            <button onClick={() => setView('cart')} className="relative p-2 btn-ripple">
              🛒 {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-accent-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cart.reduce((s,i)=>s+i.qty,0)}</span>}
            </button>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6">
          {view === 'cart' ? (
            <div>
              <div className="flex items-center gap-3 mb-6"><button onClick={() => setView('home')} className="text-accent-primary btn-ripple">← BACK</button><h2 className="font-secret text-4xl">Your Cart</h2></div>
              {cart.length === 0 ? (
                <div className="text-center py-12"><p>Cart empty</p><button onClick={() => setView('home')} className="mt-4 bg-accent-primary text-white px-6 py-2 rounded btn-ripple">Explore Menu</button></div>
              ) : (
                <>
                  {cart.map((item, idx) => (
                    <div key={item.sku} className="bg-elevated rounded-card p-3 flex items-center gap-3 mb-3 fade-up" style={{animationDelay: `${idx*0.05}s`}}>
                      <img src={item.image} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1"><p className="font-bold">{item.name}</p><p>₹{item.price}</p></div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => decrementItem(item.sku)} className="w-7 h-7 rounded-full bg-surface btn-ripple">−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => incrementItem(item.sku)} className="w-7 h-7 rounded-full bg-surface btn-ripple">+</button>
                      </div>
                      <button onClick={() => removeItem(item.sku)} className="text-error btn-ripple">✕</button>
                    </div>
                  ))}
                  <div className="bg-elevated rounded-card p-4 mt-4 space-y-2">
                    <p>Item Total: ₹{cartTotal}</p>
                    <p>Delivery: {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</p>
                    <p>Tax: ₹{tax}</p>
                    <p className="font-bold text-xl">Total: ₹{grandTotal}</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setFulfillmentMode('delivery')} className={`flex-1 py-2 rounded ${fulfillmentMode === 'delivery' ? 'bg-accent-primary text-white' : 'bg-surface'}`}>Delivery</button>
                      <button onClick={() => setFulfillmentMode('pickup')} className={`flex-1 py-2 rounded ${fulfillmentMode === 'pickup' ? 'bg-accent-primary text-white' : 'bg-surface'}`}>Pickup</button>
                    </div>
                    {loyaltyPoints >= 100 && (
                      <div className="mt-3"><p className="text-sm">Redeem points (100 pts = ₹10 off)</p><input type="range" min="0" max={Math.min(loyaltyPoints,500)} step="100" onChange={e => setRedeemedPoints(parseInt(e.target.value))} className="w-full" /></div>
                    )}
                    <button onClick={placeOrder} className="w-full mt-4 bg-accent-primary text-white py-2 rounded btn-ripple">PLACE ORDER</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="bg-surface rounded-card p-3 mb-6"><div className="flex gap-2"><span className="w-2 h-2 rounded-full bg-amber animate-pulse"></span><p>{freshEvents[tickerIdx].message}</p></div></div>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCat(cat)} className={`category-btn px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeCat === cat ? 'bg-accent-primary text-white shadow-glow' : 'bg-surface'}`}>{cat}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {menu.filter(i => i.category === activeCat).map((item, idx) => (
                  <div key={item.sku} className="bg-elevated rounded-card overflow-hidden menu-card cursor-pointer fade-up" style={{animationDelay: `${idx*0.03}s`}} onClick={() => setSelectedProduct(item)}>
                    <img src={item.image} className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <h3 className="font-bold text-sm">{item.name}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-accent-primary">₹{item.price}</span>
                        <button onClick={(e) => { e.stopPropagation(); addToCart(item); }} className="bg-accent-primary text-white px-3 py-1 rounded text-xs btn-ripple">ADD</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />
        )}
        {addressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setAddressModalOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-enter"></div>
            <div className="bg-elevated rounded-card w-80 p-5 modal-enter" onClick={e => e.stopPropagation()}>
              <h3 className="font-secret text-2xl mb-3">Select Address</h3>
              {savedAddresses.map(addr => (
                <div key={addr.id} onClick={() => { setSelectedAddressId(addr.id); setAddressModalOpen(false); }} className={`p-3 rounded border mb-2 cursor-pointer ${selectedAddressId === addr.id ? 'border-accent-primary bg-accent-primary/5' : 'border-border'}`}>
                  <p className="font-bold">{addr.label}</p><p className="text-sm">{addr.address}</p>
                </div>
              ))}
              <button onClick={() => setAddressModalOpen(false)} className="mt-2 text-accent-primary">Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
</script>
</body>
</html>
