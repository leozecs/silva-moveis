import type { MedusaAddress } from "@/lib/checkout-contract";

export type CartItem = {
  id: string;
  title?: string;
  thumbnail?: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  variant_id?: string;
  variant_title?: string;
};

export type StoreCart = {
  id: string;
  customer_id?: string | null;
  completed_at?: string | null;
  currency_code?: string;
  items?: CartItem[];
  subtotal?: number;
  shipping_total?: number;
  discount_total?: number;
  tax_total?: number;
  total?: number;
  email?: string | null;
  shipping_address?: MedusaAddress | null;
  billing_address?: MedusaAddress | null;
  metadata?: Record<string, unknown> | null;
  promotions?: Array<{ id: string; code?: string }>;
  shipping_methods?: Array<{ id: string; shipping_option_id?: string; name?: string; amount?: number }>;
  payment_collection?: { id: string } | null;
};

export const CART_STORAGE_KEY = "silva_cart_id";

export function money(value = 0, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value / 100);
}
