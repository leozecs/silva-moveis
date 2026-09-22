"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CART_STORAGE_KEY, StoreCart } from "@/lib/cart";

type CartContextValue = {
  cart: StoreCart | null;
  isLoading: boolean;
  error: string;
  itemCount: number;
  refreshCart: () => Promise<void>;
  addToCart: (variantId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<boolean>;
  removeItem: (lineItemId: string) => Promise<boolean>;
  updateCart: (data: Record<string, unknown>) => Promise<boolean>;
  cartAction: (action: string, data?: Record<string, unknown>) => Promise<unknown>;
};

const CartContext = createContext<CartContextValue | null>(null);

async function cartRequest(action: string, data: Record<string, unknown> = {}) {
  const response = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message ?? "Não foi possível atualizar o carrinho.");
  return payload;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<StoreCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshCart = useCallback(async () => {
    const id = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!id) { setCart(null); setIsLoading(false); return; }
    try {
      const response = await fetch(`/api/cart?cart_id=${encodeURIComponent(id)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Carrinho indisponível");
      setCart((await response.json()).cart ?? null);
    } catch { window.localStorage.removeItem(CART_STORAGE_KEY); setCart(null); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void refreshCart(); }, [refreshCart]);

  const run = useCallback(async (action: string, data: Record<string, unknown> = {}) => {
    setError("");
    try {
      const payload = await cartRequest(action, data);
      if (payload.cart?.id) { window.localStorage.setItem(CART_STORAGE_KEY, payload.cart.id); setCart(payload.cart); }
      return payload;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível atualizar o carrinho."); return null; }
  }, []);

  const addToCart = useCallback(async (variantId: string, quantity = 1) => {
    let id = cart?.id ?? window.localStorage.getItem(CART_STORAGE_KEY);
    if (!id) {
      const created = await run("create");
      id = created?.cart?.id;
    }
    if (!id) return false;
    return Boolean(await run("add", { cartId: id, variant_id: variantId, quantity }));
  }, [cart?.id, run]);

  const removeItem = useCallback(async (lineItemId: string) => {
    if (!cart?.id) return false;
    return Boolean(await run("remove", { cartId: cart.id, lineItemId }));
  }, [cart?.id, run]);

  const updateQuantity = useCallback(async (lineItemId: string, quantity: number) => {
    if (!cart?.id || quantity < 1) return removeItem(lineItemId);
    return Boolean(await run("update", { cartId: cart.id, lineItemId, quantity }));
  }, [cart?.id, removeItem, run]);

  const updateCart = useCallback(async (data: Record<string, unknown>) => {
    if (!cart?.id) return false;
    return Boolean(await run("update_cart", { cartId: cart.id, data }));
  }, [cart?.id, run]);

  const itemCount = useMemo(() => cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0, [cart]);
  return <CartContext.Provider value={{ cart, isLoading, error, itemCount, refreshCart, addToCart, updateQuantity, removeItem, updateCart, cartAction: run }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart precisa estar dentro de CartProvider");
  return value;
}
