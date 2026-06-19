import { useState, useEffect, useRef } from 'react';
import type { Translations, Dish, Order } from '../types';
import { useFocusTrap, categoryOrder } from '../utils';

// ---- CustomizeModal ----
export const CustomizeModal = ({
  t,
  dish,
  onClose,
  onAddToCart,
}: {
  t: Translations;
  dish: Dish;
  onClose: () => void;
  onAddToCart: (dish: Dish, customizations: string, finalPrice: number) => void;
}) => {
  const [custom, setCustom] = useState({ truffle: false, cheese: false, noOnion: false });
  const extraCost = (custom.truffle ? 20 : 0) + (custom.cheese ? 15 : 0);
  const finalPrice = dish.price + extraCost;
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, true);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-cream dark:bg-dark-chocolate rounded-3xl p-6 max-w-sm w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="font-display text-2xl font-bold mb-2">{dish.title}</h3>
        <p className="text-velvet-red font-bold text-xl mb-4">₹{dish.price}</p>
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={custom.truffle}
              onChange={(e) => setCustom({ ...custom, truffle: e.target.checked })}
            />
            {t.addTruffle}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={custom.cheese}
              onChange={(e) => setCustom({ ...custom, cheese: e.target.checked })}
            />
            {t.addCheese}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={custom.noOnion}
              onChange={(e) => setCustom({ ...custom, noOnion: e.target.checked })}
            />
            {t.noOnion}
          </label>
        </div>
        <div className="mb-4 text-right font-semibold">Total: ₹{finalPrice}</div>
        <button
          onClick={() => {
            const additions: string[] = [];
            if (custom.truffle) additions.push('Extra Cheese');
            if (custom.cheese) additions.push('Extra Sauce');
            if (custom.noOnion) additions.push('No Onion');
            onAddToCart(dish, additions.join(', ') || 'Standard', finalPrice);
            onClose();
          }}
          className="w-full py-3 bg-velvet-red text-white rounded-xl font-semibold active:scale-95"
        >
          {t.addToCart}
        </button>
      </div>
    </div>
  );
};

// ---- FeatureModal ----
export const FeatureModal = ({
  t,
  type,
  onClose,
  orders,
  coins,
  favorites,
  onOrderAgain,
  dishes,
}: {
  t: Translations;
  type: 'orders' | 'loyalty' | 'fav';
  onClose: () => void;
  orders: Order[];
  coins: number;
  favorites: number[];
  onOrderAgain: (order: Order) => void;
  dishes: Dish[];
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, true);

  let content: React.ReactNode;
  if (type === 'orders') {
    content = (
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        <h3 className="font-display text-2xl font-bold mb-4">{t.prevOrders}</h3>
        {orders.length === 0 ? (
          <p>{t.noOrders}</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="glass-card rounded-2xl p-3 flex gap-3 mb-3">
              <img
                src={order.items?.[0]?.image}
                className="w-14 h-14 rounded-xl object-cover"
                alt=""
              />
              <div className="flex-1">
                <p className="font-semibold cart-hd-text">
                  {order.items?.map((i) => i.name).join(', ')} (₹{order.total})
                </p>
                <p className="text-xs">
                  {new Date(order.created_at).toLocaleTimeString()}
                </p>
                <button
                  onClick={() => onOrderAgain(order)}
                  className="text-xs text-accent-primary mt-1 hover:underline"
                >
                  {t.orderAgain}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  } else if (type === 'loyalty') {
    content = (
      <div className="text-center py-6">
        <h3 className="font-display text-3xl font-bold mb-4">{t.loyalty}</h3>
        <p className="text-6xl font-bold text-velvet-red">{coins}</p>
      </div>
    );
  } else {
    const favDishes = dishes.filter((d) => favorites.includes(d.id));
    content = (
      <div className="max-h-[70vh] overflow-y-auto">
        <h3 className="font-display text-2xl font-bold mb-4">{t.fav}</h3>
        {favDishes.length === 0 ? (
          <p>{t.noFav}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {favDishes.map((dish) => (
              <div key={dish.id} className="glass-card rounded-xl p-2 flex gap-3">
                <img src={dish.image} className="w-16 h-16 rounded-lg object-cover" loading="lazy" alt={dish.title} />
                <div>
                  <p className="font-bold cart-hd-text">{dish.title}</p>
                  <p className="text-velvet-red">₹{dish.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-cream dark:bg-dark-chocolate rounded-3xl p-6 max-w-lg w-full max-h-[85vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {content}
        <button onClick={onClose} className="mt-5 w-full py-2 border rounded-xl">
          Close
        </button>
      </div>
    </div>
  );
};

// ---- AISuggester ----
export const AISuggester = ({
  t,
  dishes,
  onClose,
}: {
  t: Translations;
  dishes: Dish[];
  onClose: () => void;
}) => {
  const [category, setCategory] = useState('');
  const [results, setResults] = useState<Dish[]>([]);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<{ lang: string; onresult: ((e: unknown) => void) | null; onerror: (() => void) | null; start: () => void } | null>(null);

  useEffect(() => {
    const win = window as unknown as Record<string, unknown>;
    const SRClass = (win.SpeechRecognition || win.webkitSpeechRecognition) as { new(): { lang: string; onresult: ((e: unknown) => void) | null; onerror: (() => void) | null; start: () => void } } | undefined;
    if (SRClass) {
      const rec = new SRClass();
      rec.lang = 'en-US';
      rec.onresult = (event: unknown) => {
        const evt = event as { results: { transcript: string }[][] };
        const transcript = evt.results[0][0].transcript.toLowerCase();
        setCategory(transcript);
        setListening(false);
      };
      rec.onerror = () => setListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  const startVoice = () => {
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSuggest = () => {
    if (!category || category === 'all') setResults(dishes.slice(0, 8));
    else setResults(dishes.filter((d) => d.category.toLowerCase().includes(category)));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-cream dark:bg-dark-chocolate rounded-3xl p-6 max-w-md w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-2xl font-bold mb-4">{t.aiSuggester}</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              className="w-full p-2 rounded-xl bg-white dark:bg-dark-chocolate border"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">{t.cuisinePref}</option>
              {categoryOrder.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={startVoice}
              className="px-3 py-2 bg-velvet-red text-white rounded-xl active:scale-95"
            >
              <i className={`fas fa-microphone ${listening ? 'text-yellow-300' : ''}`}></i>
            </button>
          </div>
          <button
            onClick={handleSuggest}
            className="w-full py-3 bg-velvet-red text-white rounded-xl font-semibold active:scale-95"
          >
            {t.suggest}
          </button>
        </div>
        {results.length > 0 && (
          <div className="mt-4 space-y-2 max-h-48 overflow-auto">
            {results.map((dish) => (
              <div key={dish.id} className="flex gap-3 items-center p-2 glass-card rounded-xl">
                <img src={dish.image} className="w-12 h-12 rounded-lg object-cover" alt={dish.title} />
                <div>
                  <div className="font-semibold">{dish.title}</div>
                  <div className="text-xs">₹{dish.price}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
