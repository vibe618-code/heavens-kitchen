import { useState, useEffect } from 'react';
import type { Translations, Dish, Order, CartItem, Address, PaymentMethod, DiscountCodes, Settings } from '../types';
import { LS, specialsTitles } from '../utils';
import { saveOrder, updateUserCoins, fetchUserOrders } from '../lib/db';
import { openRazorpayCheckout, toPaise } from '../lib/razorpay';
import { Cursor, FloatingItems, ToastContainer, CartItemRow } from './UIComponents';
import { CustomizeModal, FeatureModal, AISuggester } from './Modals';
import { CheckoutStepIndicator, AddressBar, BillSplitCard, PaymentMethodSelector, StickyBottomCTA, OrderConfirmation } from './Checkout';
import { Hero, OurStory, MenuGallery, SignatureDishes, TestimonialsSlider, Footer, HamburgerMenu } from './Sections';

interface MainAppProps {
  t: Translations;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onSignOut: () => void;
  requestLogin: () => void;
  weatherGreeting: string;
  userName: string;
  userId: string | null;
  dishes: Dish[];
  setAllOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  discountCodes: DiscountCodes;
  onAdminClick: () => void;
  settings: Settings;
}

export default function MainApp({
  t, darkMode, toggleDarkMode, onSignOut, requestLogin, weatherGreeting,
  userName, userId, dishes, setAllOrders,
  discountCodes, onAdminClick, settings,
}: MainAppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [customizeModal, setCustomizeModal] = useState<Dish | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const [featureModal, setFeatureModal] = useState<'orders' | 'loyalty' | 'fav' | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [, setOrdersLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>(() => LS.get(`ck_fav_${userId}`, []));
  const [coins, setCoins] = useState(() => {
    if (!userId) return 0;
    const users = LS.get('ck_users', {}) as Record<string, { loyalty_coins: number }>;
    return users[userId]?.loyalty_coins ?? 0;
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutActive, setCheckoutActive] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<{ order: Order; coinsEarned: number } | null>(null);
  const [dietaryFilter, setDietaryFilter] = useState('all');
  const [fulfillmentMode, setFulfillmentMode] = useState('delivery');
  const [selectedAddress] = useState<Address>({
    id: 'addr1', label: 'Home', address: '123, MG Road, Indiranagar, Bangalore 560038', eta: '25-35 mins',
  });
  const [paymentMode, setPaymentMode] = useState('online');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Load user orders from Supabase
  useEffect(() => {
    if (userId) {
      fetchUserOrders(userId).then((supaOrders) => {
        if (supaOrders.length > 0) {
          setOrders(supaOrders);
        } else {
          // Fallback to localStorage
          setOrders(LS.get(`ck_orders_${userId}`, []) as Order[]);
        }
        setOrdersLoading(false);
      }).catch(() => {
        setOrders(LS.get(`ck_orders_${userId}`, []) as Order[]);
        setOrdersLoading(false);
      });
    } else {
      setOrdersLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      const users = LS.get('ck_users', {}) as Record<string, { loyalty_coins: number }>;
      if (users[userId]) setCoins(users[userId].loyalty_coins);
    }
  }, [userId]);
  useEffect(() => { LS.set(`ck_orders_${userId}`, orders); }, [orders, userId]);
  useEffect(() => { LS.set(`ck_fav_${userId}`, favorites); }, [favorites, userId]);

  const notify = (msg: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const addToCart = (dish: Dish, customizations: string, finalPrice: number) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.sku === dish.id && i.customizations === customizations);
      if (existing)
        return prev.map((i) =>
          i.sku === dish.id && i.customizations === customizations ? { ...i, qty: i.qty + 1 } : i
        );
      return [
        ...prev,
        {
          sku: dish.id,
          name: dish.title,
          image: dish.image,
          unitPrice: finalPrice,
          qty: 1,
          customizations: customizations || 'Standard',
        },
      ];
    });
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 400);
    notify(`${dish.title} added`);
    requestNotificationPermission();
  };

  const updateQuantity = (sku: number | string, delta: number, customKey: string) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.sku === sku && i.customizations === customKey
          ? { ...i, qty: Math.max(1, i.qty + delta) }
          : i
      )
    );
  };

  const removeItem = (sku: number | string, customKey: string) => {
    setCartItems((prev) => prev.filter((i) => !(i.sku === sku && i.customizations === customKey)));
  };

  const itemTotal = cartItems.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const proceedToCheckout = () => {
    if (!userId) { requestLogin(); return; }
    setCartOpen(false);
    setCheckoutActive(true);
  };

  const deliveryFee = fulfillmentMode === 'pickup' ? 0 : itemTotal >= 300 ? 0 : 40;
  const platformFee = 10;
  const taxRate = 0.05;
  const taxAmount = Math.round((itemTotal + deliveryFee + platformFee) * taxRate);
  const loyaltyDiscount = redeemPoints;
  const totalDiscount = loyaltyDiscount + Math.round((itemTotal * discountPercent) / 100);
  const grandTotal = Math.max(0, itemTotal + deliveryFee + platformFee + taxAmount - totalDiscount);

  const applyDiscountCode = () => {
    const code = discountCodeInput.trim().toUpperCase();
    const percent = discountCodes[code];
    if (percent) {
      setDiscountPercent(percent);
      notify(`Discount code applied: ${percent}% off`);
    } else {
      notify('Invalid discount code');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod || !userId) return;
    setIsProcessing(true);

    const orderId = Date.now();
    const order: Order = {
      id: orderId,
      customer: { name: userName, phone: userId },
      items: cartItems.map((i) => ({
        name: i.name,
        image: i.image,
        unitPrice: i.unitPrice,
        qty: i.qty,
        customizations: i.customizations,
      })),
      total: grandTotal,
      eta: fulfillmentMode === 'delivery' ? '25-35 mins' : '15-20 mins',
      created_at: new Date().toISOString(),
      status: 'Processing',
    };

    // If paying online, open Razorpay
    if (paymentMode === 'online') {
      try {
        await openRazorpayCheckout(
          toPaise(grandTotal),
          userName,
          userId,
          `Order #${orderId} — ${cartItems.map(i => i.name).join(', ')}`,
          async (razorpayResponse) => {
            // Payment success — save order to Supabase
            const orderWithPayment = {
              ...order,
              payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_order_id: razorpayResponse.razorpay_order_id,
            } as Order & { payment_id: string; razorpay_order_id: string };

            await saveOrder(orderWithPayment);
            setOrders((prev) => [orderWithPayment, ...prev]);
            setAllOrders((prev) => [orderWithPayment, ...prev]);

            // Update loyalty coins
            const newCoins = coins - redeemPoints + 10;
            await updateUserCoins(userId, Math.max(0, newCoins));
            setCoins(Math.max(0, newCoins));
            // Also update localStorage
            const users = LS.get('ck_users', {}) as Record<string, { loyalty_coins: number }>;
            if (users[userId]) {
              users[userId].loyalty_coins = Math.max(0, newCoins);
              LS.set('ck_users', users);
            }

            finalizeOrder(orderWithPayment);
          },
          () => {
            // Payment dismissed
            setIsProcessing(false);
            notify('Payment cancelled');
          }
        );
      } catch {
        setIsProcessing(false);
        notify('Payment failed. Please try again.');
      }
    } else {
      // COD / Pay at Doorstep — save directly
      await saveOrder(order);
      setOrders((prev) => [order, ...prev]);
      setAllOrders((prev) => [order, ...prev]);

      const newCoins = coins - redeemPoints + 10;
      await updateUserCoins(userId, Math.max(0, newCoins));
      setCoins(Math.max(0, newCoins));
      const users = LS.get('ck_users', {}) as Record<string, { loyalty_coins: number }>;
      if (users[userId]) {
        users[userId].loyalty_coins = Math.max(0, newCoins);
        LS.set('ck_users', users);
      }

      finalizeOrder(order);
    }
  };

  const finalizeOrder = (order: Order) => {
    setCartItems([]);
    setCheckoutActive(false);
    setTrackingOrder({ order, coinsEarned: 10 });
    setRedeemPoints(0);
    setDiscountCodeInput('');
    setDiscountPercent(0);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Order Placed!', { body: `+10 coins earned. ETA: ${order.eta}` });
    }
    setIsProcessing(false);
  };

  const toggleFavorite = (dishId: number) => {
    setFavorites((prev) =>
      prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId]
    );
  };

  const handleNavigate = (action: string) => {
    if (action === 'orders') setFeatureModal('orders');
    else if (action === 'loyalty') setFeatureModal('loyalty');
    else if (action === 'fav') setFeatureModal('fav');
    else if (action === 'signout') onSignOut();
  };

  const onOrderAgain = (order: Order) => {
    setCartItems(
      order.items.map((i) => ({
        sku: Date.now() + Math.random(),
        name: i.name,
        image: i.image,
        unitPrice: i.unitPrice,
        qty: i.qty,
        customizations: i.customizations || 'Standard',
      }))
    );
    setFeatureModal(null);
    notify('Order added to cart!');
  };

  if (trackingOrder) {
    return (
      <OrderConfirmation
        t={t}
        order={trackingOrder.order}
        coinsEarned={trackingOrder.coinsEarned}
        onBack={() => setTrackingOrder(null)}
      />
    );
  }

  if (checkoutActive) {
    return (
      <div className="min-h-screen bg-cream dark:bg-dark-chocolate relative">
        <header className="sticky top-0 z-10 bg-white dark:bg-dark-chocolate border-b px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <button
              onClick={() => setCheckoutActive(false)}
              className="text-accent-primary font-semibold text-sm"
            >
              <i className="fas fa-arrow-left mr-1"></i> Back
            </button>
            <span className="font-display text-xl font-bold text-accent-primary">Checkout</span>
            <div className="w-8"></div>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6 pb-24">
          <CheckoutStepIndicator step={2} />
          {cartItems.length === 0 ? (
            <div className="text-center py-12"><p>Cart empty</p></div>
          ) : (
            <>
              <AddressBar
                address={selectedAddress}
                fulfillmentMode={fulfillmentMode}
                onEditAddress={() => {}}
                onChangeFulfillment={setFulfillmentMode}
              />
              <div className="mb-4 space-y-2">
                {cartItems.map((item) => (
                  <CartItemRow
                    key={item.sku + item.customizations}
                    item={item}
                    onIncrement={(sku, c) => updateQuantity(sku, 1, c)}
                    onDecrement={(sku, c) => updateQuantity(sku, -1, c)}
                    onRemove={removeItem}
                  />
                ))}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">{t.discountCode}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCodeInput}
                    onChange={(e) => setDiscountCodeInput(e.target.value)}
                    className="flex-1 p-2 rounded-xl border bg-white dark:bg-dark-chocolate"
                    placeholder="Enter code"
                  />
                  <button
                    onClick={applyDiscountCode}
                    className="px-4 py-2 bg-velvet-red text-white rounded-xl active:scale-95"
                  >
                    {t.apply}
                  </button>
                </div>
              </div>
              <BillSplitCard
                t={t}
                itemTotal={itemTotal}
                deliveryFee={deliveryFee}
                platformFee={platformFee}
                taxRate={taxRate}
                discount={totalDiscount}
                loyaltyPointsRedeemed={redeemPoints}
                onRedeemPoints={setRedeemPoints}
                availablePoints={coins}
              />
              <PaymentMethodSelector
                paymentMode={paymentMode}
                onPaymentModeChange={setPaymentMode}
                selectedMethod={selectedPaymentMethod}
                onSelectMethod={setSelectedPaymentMethod}
                fulfillmentMode={fulfillmentMode}
              />
              <StickyBottomCTA
                t={t}
                grandTotal={grandTotal}
                isProcessing={isProcessing}
                disabled={!selectedPaymentMethod}
                onPlaceOrder={handlePlaceOrder}
              />
            </>
          )}
        </main>
      </div>
    );
  }

  // Main view
  if (typeof window !== 'undefined') (window as unknown as Record<string, unknown>).__globalDishes = dishes;
  const specials = dishes.filter((d) => specialsTitles.includes(d.title));
  const menuDishes = dishes.filter((d) => !specialsTitles.includes(d.title));

  return (
    <div className="relative">
      <Cursor />
      <FloatingItems />
      <header className="fixed top-0 left-0 right-0 z-30 glass shadow-lg py-3">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-full glass-card focus:outline-none"
              aria-label="Menu"
            >
              <div className="hamburger-icon">
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
              </div>
            </button>
            <a href="#hero" className="font-display text-2xl font-bold">
              CLOUD KITCHEN<span className="text-red-velvet">.</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm italic hidden sm:inline cart-hd-text">{weatherGreeting}</span>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-full glass-card"
              aria-label="Cart"
            >
              <i className={`fas fa-shopping-cart text-xl ${cartBounce ? 'animate-bounce-cart' : ''}`}></i>
              {cartItems.reduce((s, i) => s + i.qty, 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-velvet text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItems.reduce((s, i) => s + i.qty, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <HamburgerMenu
        t={t}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onNavigate={handleNavigate}
        userName={userName}
        loyaltyPoints={coins}
      />

      {/* Cart Drawer */}
      <div className={`fixed inset-0 z-50 flex justify-end ${cartOpen ? 'visible' : 'invisible'}`}>
        {cartOpen && (
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          ></div>
        )}
        <div
          className={`relative w-full max-w-md bg-cream dark:bg-dark-chocolate shadow-2xl h-full flex flex-col ${cartOpen ? 'cart-drawer-enter' : ''}`}
        >
          <div className="flex justify-between items-center p-5 border-b">
            <h2 className="font-display text-2xl font-bold">
              <i className="fas fa-shopping-bag"></i> {t.cart} (
              {cartItems.reduce((s, i) => s + i.qty, 0)})
            </h2>
            <button onClick={() => setCartOpen(false)} className="text-2xl">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length === 0 ? (
              <p className="text-center py-8">{t.emptyCart}</p>
            ) : (
              cartItems.map((item) => (
                <CartItemRow
                  key={item.sku + item.customizations}
                  item={item}
                  onIncrement={(sku, c) => updateQuantity(sku, 1, c)}
                  onDecrement={(sku, c) => updateQuantity(sku, -1, c)}
                  onRemove={removeItem}
                />
              ))
            )}
          </div>
          <div className="p-5 border-t space-y-3">
            <div className="flex justify-between font-bold text-lg">
              <span>{t.itemTotal}</span>
              <span className="cart-total-hd">₹{itemTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={proceedToCheckout}
              disabled={cartItems.length === 0}
              className="w-full py-3 bg-velvet-red text-white rounded-xl font-semibold disabled:opacity-50 transition active:scale-95"
            >
              {t.checkout}
            </button>
          </div>
        </div>
      </div>

      {customizeModal && (
        <CustomizeModal
          t={t}
          dish={customizeModal}
          onClose={() => setCustomizeModal(null)}
          onAddToCart={addToCart}
        />
      )}
      {showAI && (
        <AISuggester t={t} dishes={dishes} onClose={() => setShowAI(false)} />
      )}
      {featureModal && (
        <FeatureModal
          t={t}
          type={featureModal}
          onClose={() => setFeatureModal(null)}
          orders={orders}
          coins={coins}
          favorites={favorites}
          onOrderAgain={onOrderAgain}
          dishes={dishes}
        />
      )}
      <ToastContainer toasts={toasts} />

      <main className="pt-20">
        <Hero t={t} />
        <OurStory storyImg={settings?.storyImg} />
        <MenuGallery
          t={t}
          dishes={menuDishes}
          onOrder={(dish) => setCustomizeModal(dish)}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          dietaryFilter={dietaryFilter}
          setDietaryFilter={setDietaryFilter}
        />
        <SignatureDishes t={t} specials={specials} onOrder={(dish) => setCustomizeModal(dish)} />
        <TestimonialsSlider />
        <Footer onAdminClick={onAdminClick} />
      </main>

      <button
        onClick={() => setShowAI(true)}
        className="fixed bottom-8 right-8 z-40 bg-velvet-red text-white p-4 rounded-full shadow-2xl hover:bg-red-velvet animate-pulse-soft"
        aria-label="AI Menu Recommender"
      >
        <i className="fas fa-robot text-xl"></i>
      </button>
    </div>
  );
}
