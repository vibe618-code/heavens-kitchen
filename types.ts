const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
export const isRazorpayConfigured = !!RAZORPAY_KEY_ID;

// ---- Razorpay Type Declarations ----
declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill: { name: string; contact: string; email: string };
  notes: Record<string, string>;
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void; escape: boolean; animation: boolean };
  retry: { enabled: boolean };
  timeout: number;
  theme: { color: string };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, cb: () => void) => void;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// ---- Script Loader ----
let scriptLoaded = false;
let scriptLoading = false;

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (scriptLoaded) { resolve(true); return; }
    if (scriptLoading) {
      const check = setInterval(() => {
        if (scriptLoaded) { clearInterval(check); resolve(true); }
      }, 100);
      return;
    }
    scriptLoading = true;
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => { scriptLoaded = true; scriptLoading = false; resolve(true); };
    s.onerror = () => { scriptLoading = false; resolve(false); };
    document.head.appendChild(s);
  });
}

// ---- Open Checkout ----
export function openRazorpayCheckout(
  amountPaise: number,
  name: string,
  phone: string,
  description: string,
  onSuccess: (res: RazorpayResponse) => void,
  onDismiss: () => void
): Promise<void> {
  return new Promise(async (resolve) => {
    if (!isRazorpayConfigured) {
      console.warn('⚠️ Razorpay not configured — simulating payment');
      onSuccess({
        razorpay_payment_id: `pay_sim_${Date.now()}`,
        razorpay_order_id: `order_sim_${Date.now()}`,
        razorpay_signature: 'simulated',
      });
      resolve();
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      console.warn('⚠️ Razorpay script failed to load — simulating payment');
      onSuccess({
        razorpay_payment_id: `pay_sim_${Date.now()}`,
        razorpay_order_id: `order_sim_${Date.now()}`,
        razorpay_signature: 'simulated',
      });
      resolve();
      return;
    }

    const rzp = new window.Razorpay({
      key: RAZORPAY_KEY_ID!,
      amount: amountPaise,
      currency: 'INR',
      name: 'Cloud Kitchen Co.',
      description,
      prefill: { name, contact: phone, email: '' },
      notes: { source: 'cloud_kitchen_app' },
      handler: (response: RazorpayResponse) => {
        onSuccess(response);
        resolve();
      },
      modal: {
        ondismiss: () => { onDismiss(); resolve(); },
        escape: true,
        animation: true,
      },
      retry: { enabled: false },
      timeout: 300,
      theme: { color: '#8B1E2D' },
    });

    rzp.on('payment.failed', () => { /* handled via dismiss */ });
    rzp.open();
  });
}

// ---- Helpers ----
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
