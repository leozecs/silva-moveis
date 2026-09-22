export type CartItem = {
  id: string;
  title?: string;
  thumbnail?: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  variant_id?: string;
};

export type StoreCart = {
  id: string;
  currency_code?: string;
  items?: CartItem[];
  subtotal?: number;
  shipping_total?: number;
  discount_total?: number;
  tax_total?: number;
  total?: number;
  email?: string | null;
  shipping_address?: Record<string, unknown> | null;
  payment_collection?: { id: string } | null;
};

export const CART_STORAGE_KEY = "silva_cart_id";

export function money(value = 0, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value / 100);
}
