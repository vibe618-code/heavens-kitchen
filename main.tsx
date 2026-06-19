import { supabase, isSupabaseConfigured } from './supabase';
import { LS } from '../utils';
import type { Dish, Order, Settings, DiscountCodes } from '../types';

// ============================================================
//  DATABASE LAYER — Supabase-first, localStorage fallback
// ============================================================

// ---- Dishes ----
export async function fetchDishes(): Promise<Dish[]> {
  if (!isSupabaseConfigured || !supabase) {
    return LS.get('ck_dishes', []) as Dish[];
  }
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .order('category')
    .order('title');
  if (error) {
    console.error('fetchDishes error:', error);
    return LS.get('ck_dishes', []) as Dish[];
  }
  return (data || []).map((d: Record<string, unknown>) => ({
    id: d.id as number,
    category: d.category as string,
    title: d.title as string,
    price: d.price as number,
    image: d.image as string,
    dietary: d.dietary as 'veg' | 'non-veg',
    inStock: d.in_stock as boolean,
  }));
}

export async function saveDish(dish: Dish, isNew: boolean): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    const dishes = LS.get('ck_dishes', []) as Dish[];
    if (isNew) {
      LS.set('ck_dishes', [...dishes, dish]);
    } else {
      LS.set('ck_dishes', dishes.map(d => d.id === dish.id ? dish : d));
    }
    return true;
  }
  if (isNew) {
    const { error } = await supabase.from('dishes').insert({
      id: dish.id,
      category: dish.category,
      title: dish.title,
      price: dish.price,
      image: dish.image,
      dietary: dish.dietary,
      in_stock: dish.inStock,
    });
    if (error) { console.error('saveDish insert error:', error); return false; }
  } else {
    const { error } = await supabase.from('dishes').update({
      category: dish.category, title: dish.title, price: dish.price,
      image: dish.image, dietary: dish.dietary, in_stock: dish.inStock,
    }).eq('id', dish.id);
    if (error) { console.error('saveDish update error:', error); return false; }
  }
  return true;
}

export async function deleteDishDB(id: number): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    const dishes = LS.get('ck_dishes', []) as Dish[];
    LS.set('ck_dishes', dishes.filter(d => d.id !== id));
    return true;
  }
  const { error } = await supabase.from('dishes').delete().eq('id', id);
  if (error) { console.error('deleteDish error:', error); return false; }
  return true;
}

// ---- Orders ----
export async function fetchAllOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured || !supabase) {
    return LS.get('ck_all_orders', []) as Order[];
  }
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('fetchAllOrders error:', error);
    return LS.get('ck_all_orders', []) as Order[];
  }
  return (data || []).map((o: Record<string, unknown>) => ({
    id: o.id as number,
    customer: (o.customer as { name: string; phone: string }) || { name: '', phone: '' },
    items: (o.items as Order['items']) || [],
    total: o.total as number,
    eta: o.eta as string,
    created_at: o.created_at as string,
    status: o.status as string,
    payment_id: o.payment_id as string | undefined,
    razorpay_order_id: o.razorpay_order_id as string | undefined,
  }));
}

export async function fetchUserOrders(phone: string): Promise<Order[]> {
  if (!isSupabaseConfigured || !supabase) {
    return LS.get(`ck_orders_${phone}`, []) as Order[];
  }
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_phone', phone)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('fetchUserOrders error:', error);
    return LS.get(`ck_orders_${phone}`, []) as Order[];
  }
  return (data || []).map((o: Record<string, unknown>) => ({
    id: o.id as number,
    customer: { name: (o.customer_name as string) || '', phone: (o.customer_phone as string) || '' },
    items: (o.items as Order['items']) || [],
    total: o.total as number,
    eta: o.eta as string,
    created_at: o.created_at as string,
    status: o.status as string,
    payment_id: o.payment_id as string | undefined,
    razorpay_order_id: o.razorpay_order_id as string | undefined,
  }));
}

export async function saveOrder(order: Order): Promise<boolean> {
  // Always save locally too
  if (!isSupabaseConfigured || !supabase) {
    const all = LS.get('ck_all_orders', []) as Order[];
    LS.set('ck_all_orders', [order, ...all]);
    const userOrders = LS.get(`ck_orders_${order.customer.phone}`, []) as Order[];
    LS.set(`ck_orders_${order.customer.phone}`, [order, ...userOrders]);
    return true;
  }
  const { error } = await supabase.from('orders').insert({
    id: order.id,
    customer_name: order.customer.name,
    customer_phone: order.customer.phone,
    items: order.items,
    total: order.total,
    eta: order.eta,
    created_at: order.created_at,
    status: order.status,
    payment_id: (order as unknown as Record<string, unknown>).payment_id || null,
    razorpay_order_id: (order as unknown as Record<string, unknown>).razorpay_order_id || null,
  });
  if (error) {
    console.error('saveOrder error:', error);
    // Fallback: save locally
    const all = LS.get('ck_all_orders', []) as Order[];
    LS.set('ck_all_orders', [order, ...all]);
    return false;
  }
  return true;
}

export async function updateOrderStatus(id: number, status: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    const orders = LS.get('ck_all_orders', []) as Order[];
    LS.set('ck_all_orders', orders.map(o => o.id === id ? { ...o, status } : o));
    return true;
  }
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) { console.error('updateOrderStatus error:', error); return false; }
  return true;
}

// ---- Users (auth + loyalty) ----
export async function fetchUser(phone: string): Promise<Record<string, unknown> | null> {
  if (!isSupabaseConfigured || !supabase) {
    const users = LS.get('ck_users', {}) as Record<string, Record<string, unknown>>;
    return users[phone] || null;
  }
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();
  if (error) {
    // User might not exist
    if (error.code === 'PGRST116') return null;
    console.error('fetchUser error:', error);
    return null;
  }
  return data as Record<string, unknown>;
}

export async function saveUser(user: {
  phone: string;
  password: string;
  name: string;
  address: string;
  loyalty_coins: number;
}): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    const users = LS.get('ck_users', {}) as Record<string, unknown>;
    users[user.phone] = user;
    LS.set('ck_users', users);
    return true;
  }
  const { error } = await supabase.from('users').upsert({
    phone: user.phone,
    password: user.password,
    name: user.name,
    address: user.address,
    loyalty_coins: user.loyalty_coins,
  });
  if (error) { console.error('saveUser error:', error); return false; }
  return true;
}

export async function updateUserCoins(phone: string, coins: number): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    const users = LS.get('ck_users', {}) as Record<string, Record<string, unknown>>;
    if (users[phone]) { users[phone].loyalty_coins = coins; LS.set('ck_users', users); }
    return true;
  }
  const { error } = await supabase.from('users').update({ loyalty_coins: coins }).eq('phone', phone);
  if (error) { console.error('updateUserCoins error:', error); return false; }
  return true;
}

// ---- Discount Codes ----
export async function fetchDiscountCodes(): Promise<DiscountCodes> {
  if (!isSupabaseConfigured || !supabase) {
    return LS.get('ck_discounts', {}) as DiscountCodes;
  }
  const { data, error } = await supabase.from('discount_codes').select('*');
  if (error) {
    console.error('fetchDiscountCodes error:', error);
    return LS.get('ck_discounts', {}) as DiscountCodes;
  }
  const codes: DiscountCodes = {};
  (data || []).forEach((d: Record<string, unknown>) => {
    codes[d.code as string] = d.percent as number;
  });
  return codes;
}

export async function saveDiscountCode(code: string, percent: number): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    const codes = LS.get('ck_discounts', {}) as DiscountCodes;
    codes[code] = percent;
    LS.set('ck_discounts', codes);
    return true;
  }
  const { error } = await supabase.from('discount_codes').upsert({ code, percent });
  if (error) { console.error('saveDiscountCode error:', error); return false; }
  return true;
}

export async function deleteDiscountCodeDB(code: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    const codes = LS.get('ck_discounts', {}) as DiscountCodes;
    delete codes[code];
    LS.set('ck_discounts', codes);
    return true;
  }
  const { error } = await supabase.from('discount_codes').delete().eq('code', code);
  if (error) { console.error('deleteDiscountCode error:', error); return false; }
  return true;
}

// ---- Settings ----
export async function fetchSettings(): Promise<Settings> {
  if (!isSupabaseConfigured || !supabase) {
    return LS.get('ck_settings', { loaderBg: '', storyImg: '' }) as Settings;
  }
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) {
    console.error('fetchSettings error:', error);
    return LS.get('ck_settings', { loaderBg: '', storyImg: '' }) as Settings;
  }
  const settings: Settings = { loaderBg: '', storyImg: '' };
  (data || []).forEach((s: Record<string, unknown>) => {
    if (s.key === 'loaderBg') settings.loaderBg = s.value as string;
    if (s.key === 'storyImg') settings.storyImg = s.value as string;
  });
  return settings;
}

export async function saveSettings(settings: Settings): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    LS.set('ck_settings', settings);
    return true;
  }
  // Upsert both keys
  const { error: e1 } = await supabase.from('site_settings').upsert({ key: 'loaderBg', value: settings.loaderBg });
  const { error: e2 } = await supabase.from('site_settings').upsert({ key: 'storyImg', value: settings.storyImg });
  if (e1 || e2) { console.error('saveSettings error:', e1 || e2); return false; }
  return true;
}

// ---- Realtime subscription for orders (admin dashboard) ----
export function subscribeToOrders(onInsert: (order: Order) => void, onUpdate: (order: Order) => void) {
  if (!isSupabaseConfigured || !supabase) return { unsubscribe: () => {} };

  const channel = supabase.channel('orders-realtime').on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'orders' },
    (payload) => {
      const o = payload.new as Record<string, unknown>;
      onInsert({
        id: o.id as number,
        customer: { name: (o.customer_name as string) || '', phone: (o.customer_phone as string) || '' },
        items: (o.items as Order['items']) || [],
        total: o.total as number,
        eta: o.eta as string,
        created_at: o.created_at as string,
        status: o.status as string,
      });
    }
  ).on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'orders' },
    (payload) => {
      const o = payload.new as Record<string, unknown>;
      onUpdate({
        id: o.id as number,
        customer: { name: (o.customer_name as string) || '', phone: (o.customer_phone as string) || '' },
        items: (o.items as Order['items']) || [],
        total: o.total as number,
        eta: o.eta as string,
        created_at: o.created_at as string,
        status: o.status as string,
      });
    }
  ).subscribe();

  return {
    unsubscribe: () => {
      supabase!.removeChannel(channel);
    },
  };
}
