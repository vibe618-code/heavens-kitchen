import { useState, useEffect } from 'react';
import type { Translations, Address, PaymentMethod, Order } from '../types';
import { AnimatedCheckmark } from './UIComponents';

// ---- CheckoutStepIndicator ----
export const CheckoutStepIndicator = ({ step }: { step: number }) => (
  <div className="flex justify-center mb-6">
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-velvet-red text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500'}`}>1</div>
      <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-700"></div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-velvet-red text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500'}`}>2</div>
      <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-700"></div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-velvet-red text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500'}`}>3</div>
    </div>
  </div>
);

// ---- AddressBar ----
export const AddressBar = ({
  address,
  fulfillmentMode,
  onEditAddress,
  onChangeFulfillment,
}: {
  address?: Address;
  fulfillmentMode: string;
  onEditAddress: () => void;
  onChangeFulfillment: (mode: string) => void;
}) => {
  const isDelivery = fulfillmentMode === 'delivery';
  return (
    <div className="bg-white/60 dark:bg-dark-chocolate/60 rounded-2xl p-4 mb-4 border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg font-semibold">
          {isDelivery ? 'Delivery Address' : 'Pickup Location'}
        </h3>
        {isDelivery && (
          <button onClick={onEditAddress} className="text-accent-primary text-sm font-semibold hover:underline">
            Edit / Change
          </button>
        )}
      </div>
      {isDelivery ? (
        <div className="flex items-start gap-3">
          <i className="fas fa-map-marker-alt text-2xl mt-1 text-accent-secondary"></i>
          <div>
            <p className="font-semibold cart-hd-text">
              {address?.label || 'Home'}
              <span className="ml-2 text-xs bg-accent-secondary/20 text-accent-secondary px-2 py-0.5 rounded-full">
                {address?.eta || '25-35 mins'}
              </span>
            </p>
            <p className="text-sm mt-0.5">{address?.address || 'Add your delivery address'}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <i className="fas fa-store text-2xl mt-1 text-accent-secondary"></i>
          <div>
            <p className="font-semibold cart-hd-text">
              Heaven's Kitchen
              <span className="ml-2 text-xs bg-accent-secondary/20 text-accent-secondary px-2 py-0.5 rounded-full">
                Ready in 15-20 mins
              </span>
            </p>
            <p className="text-sm mt-0.5">789, Food Street, Indiranagar, Bangalore 560038</p>
          </div>
        </div>
      )}
      <div className="flex mt-4 bg-white/70 dark:bg-black/30 rounded-xl p-1 border">
        <button
          onClick={() => onChangeFulfillment('delivery')}
          className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition ${isDelivery ? 'bg-accent-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          <i className="fas fa-truck mr-1"></i> Doorstep
        </button>
        <button
          onClick={() => onChangeFulfillment('pickup')}
          className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition ${!isDelivery ? 'bg-accent-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          <i className="fas fa-utensils mr-1"></i> Pickup
        </button>
      </div>
    </div>
  );
};

// ---- BillSplitCard ----
export const BillSplitCard = ({
  t,
  itemTotal,
  deliveryFee,
  platformFee,
  taxRate,
  discount,
  loyaltyPointsRedeemed,
  onRedeemPoints,
  availablePoints,
}: {
  t: Translations;
  itemTotal: number;
  deliveryFee: number;
  platformFee: number;
  taxRate: number;
  discount: number;
  loyaltyPointsRedeemed: number;
  onRedeemPoints: (pts: number) => void;
  availablePoints: number;
}) => {
  const [redeem, setRedeem] = useState(0);
  const taxAmount = Math.round((itemTotal + deliveryFee + platformFee) * taxRate);
  const grandTotal = Math.max(0, itemTotal + deliveryFee + platformFee + taxAmount - discount);

  useEffect(() => {
    onRedeemPoints(redeem);
  }, [redeem]);

  const maxRedeem = Math.min(availablePoints, 50);
  const canRedeem = availablePoints >= 10;

  return (
    <div className="bg-white/60 dark:bg-dark-chocolate/60 rounded-2xl p-5 mb-4 border">
      <h3 className="font-display text-lg font-semibold mb-4">Bill Details</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Item Total</span>
          <span className="cart-hd-text">₹{itemTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span>
            {deliveryFee === 0 ? (
              <span className="text-success font-semibold">FREE</span>
            ) : (
              `₹${deliveryFee.toFixed(2)}`
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Platform Fee</span>
          <span>₹{platformFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST ({(taxRate * 100).toFixed(0)}%)</span>
          <span>₹{taxAmount.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-success animate-coin-pulse">
            <span>Loyalty Discount ({loyaltyPointsRedeemed} pts)</span>
            <span>− ₹{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t pt-2 mt-2"></div>
        <div className="flex justify-between text-base">
          <span className="font-display font-bold">Grand Total</span>
          <span className="font-display font-bold cart-total-hd">₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t">
        <p className="text-xs mb-2">
          {canRedeem
            ? t.redeemNote
            : `Need ${10 - availablePoints} more coin${availablePoints === 9 ? '' : 's'}`}
        </p>
        <input
          type="range"
          min="0"
          max={maxRedeem}
          step="10"
          value={redeem}
          onChange={(e) => setRedeem(Number(e.target.value))}
          disabled={!canRedeem}
          className={`w-full ${!canRedeem ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        <div className="flex justify-between text-xs mt-1">
          <span>0 pts</span>
          <span>{canRedeem ? `${maxRedeem} pts` : `${availablePoints} pts`}</span>
        </div>
      </div>
    </div>
  );
};

// ---- PaymentMethodSelector ----
export const PaymentMethodSelector = ({
  paymentMode,
  onPaymentModeChange,
  selectedMethod,
  onSelectMethod,
  fulfillmentMode,
}: {
  paymentMode: string;
  onPaymentModeChange: (mode: string) => void;
  selectedMethod: PaymentMethod | null;
  onSelectMethod: (method: PaymentMethod) => void;
  fulfillmentMode: string;
}) => {
  const isDelivery = fulfillmentMode === 'delivery';
  const onlineMethods: PaymentMethod[] = [
    { id: 'card1', label: 'Visa •••• 4242', icon: 'fab fa-cc-visa' },
    { id: 'upi', label: 'UPI / Google Pay', icon: 'fas fa-mobile-alt' },
  ];
  const doorstepMethods: PaymentMethod[] = [
    { id: 'cod', label: 'Cash on Delivery', icon: 'fas fa-money-bill-wave' },
    { id: 'cardAtDoor', label: 'Card at Door', icon: 'fas fa-credit-card' },
  ];
  const methods = paymentMode === 'online' ? onlineMethods : doorstepMethods;

  return (
    <div className="bg-white/60 dark:bg-dark-chocolate/60 rounded-2xl p-5 mb-4 border">
      <h3 className="font-display text-lg font-semibold mb-4">Payment Method</h3>
      <div className="flex bg-white/70 dark:bg-black/30 rounded-xl p-1 mb-4 border">
        <button
          onClick={() => onPaymentModeChange('online')}
          className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition ${paymentMode === 'online' ? 'bg-accent-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          <i className="fas fa-globe mr-1"></i> Pay Online
        </button>
        <button
          onClick={() => onPaymentModeChange('doorstep')}
          className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition ${paymentMode === 'doorstep' ? 'bg-accent-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          <i className="fas fa-hand-holding-usd mr-1"></i>{' '}
          {isDelivery ? 'Pay at Doorstep' : 'Pay at Counter'}
        </button>
      </div>
      <div className="space-y-2">
        {methods.map((method) => (
          <div
            key={method.id}
            onClick={() => onSelectMethod(method)}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition ${
              selectedMethod?.id === method.id
                ? 'border-accent-primary bg-accent-primary/5'
                : 'border-gray-200 dark:border-gray-700 hover:border-accent-secondary/50'
            }`}
          >
            <i className={`${method.icon} text-2xl`}></i>
            <div className="flex-1">
              <p className="cart-hd-text">{method.label}</p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedMethod?.id === method.id ? 'border-accent-primary' : 'border-gray-300'
              }`}
            >
              {selectedMethod?.id === method.id && (
                <div className="w-3 h-3 rounded-full bg-accent-primary"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---- StickyBottomCTA ----
export const StickyBottomCTA = ({
  t,
  grandTotal,
  isProcessing,
  disabled,
  onPlaceOrder,
}: {
  t: Translations;
  grandTotal: number;
  isProcessing: boolean;
  disabled: boolean;
  onPlaceOrder: () => void;
}) => (
  <div className="sticky bottom-0 z-20 bg-white dark:bg-dark-chocolate border-t px-4 py-4">
    <div className="max-w-lg mx-auto">
      <button
        onClick={onPlaceOrder}
        disabled={disabled || isProcessing}
        className={`w-full font-semibold py-4 px-6 rounded-xl text-base flex items-center justify-center gap-2 transition active:scale-95 ${
          disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-accent-primary text-white hover:brightness-110'
        }`}
      >
        {isProcessing ? (
          <>
            <span className="spinner"></span> Processing...
          </>
        ) : (
          `${t.placeOrder} ₹${grandTotal.toFixed(2)}`
        )}
      </button>
      {disabled && !isProcessing && (
        <p className="text-xs text-error text-center mt-2">⚠️ Please select a payment method</p>
      )}
    </div>
  </div>
);

// ---- OrderConfirmation ----
export const OrderConfirmation = ({
  t,
  order,
  coinsEarned,
  onBack,
}: {
  t: Translations;
  order: Order;
  coinsEarned: number;
  onBack: () => void;
}) => {
  const [showTracking, setShowTracking] = useState(false);
  const [progress, setProgress] = useState(0);
  const etaMinutes = parseInt(order.eta) || 30;
  const totalDuration = etaMinutes * 60000;

  useEffect(() => {
    const timer = setTimeout(() => setShowTracking(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showTracking) return;
    const stepMs = 100;
    const totalSteps = totalDuration / stepMs;
    let cur = 0;
    const interval = setInterval(() => {
      cur++;
      const pct = Math.min(100, (cur / totalSteps) * 100);
      setProgress(pct);
      if (cur >= totalSteps) clearInterval(interval);
    }, stepMs);
    return () => clearInterval(interval);
  }, [showTracking, totalDuration]);

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-chocolate p-6 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full bg-white/80 dark:bg-dark-chocolate/80 rounded-2xl p-8 shadow-lg border text-center">
        <div className="confirm-check-center mb-4">
          <AnimatedCheckmark />
        </div>
        <h2 className="font-display text-3xl font-bold mt-4 mb-2">{t.orderSuccess}</h2>
        <p className="text-success font-semibold text-lg mb-6">+{coinsEarned} Coins earned</p>
        {showTracking && (
          <div className="animate-fade-in">
            <h3 className="font-display text-xl font-semibold mb-4">{t.trackOrder}</h3>
            <div className="flex items-center gap-4 bg-white/70 dark:bg-black/20 rounded-2xl p-4 border mb-6">
              <i className="fas fa-motorcycle text-3xl text-accent-primary"></i>
              <div>
                <p className="font-bold">
                  {progress < 25
                    ? t.confirmed
                    : progress < 50
                      ? t.preparing
                      : progress < 75
                        ? t.out
                        : t.delivered}
                </p>
                <p className="text-sm">
                  ETA: <strong className="text-accent-primary">{order.eta}</strong>
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 mb-3 overflow-hidden">
              <div
                className="bg-success h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        <button
          onClick={onBack}
          className="mt-6 w-full py-3 bg-velvet-red text-white rounded-xl font-semibold hover:bg-red-velvet active:scale-95"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};
