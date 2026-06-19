export interface Dish {
  id: number;
  category: string;
  title: string;
  price: number;
  image: string;
  dietary: 'veg' | 'non-veg';
  inStock: boolean;
}

export interface CartItem {
  sku: number | string;
  name: string;
  image: string;
  unitPrice: number;
  qty: number;
  customizations: string;
}

export interface Order {
  id: number;
  customer: { name: string; phone: string };
  items: { name: string; image: string; unitPrice: number; qty: number; customizations: string }[];
  total: number;
  eta: string;
  created_at: string;
  status: string;
}

export interface User {
  phone: string;
  password: string;
  name: string;
  address: string;
  loyalty_coins: number;
}

export interface Settings {
  loaderBg: string;
  storyImg: string;
}

export interface DiscountCodes {
  [code: string]: number;
}

export interface Address {
  id: string;
  label: string;
  address: string;
  eta: string;
}

export interface PaymentMethod {
  id: string;
  label: string;
  icon: string;
}

export interface Toast {
  id: number;
  msg: string;
}

export interface Translations {
  [key: string]: string;
}
