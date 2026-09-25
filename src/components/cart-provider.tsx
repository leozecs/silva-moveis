"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CART_STORAGE_KEY, type StoreCart } from "@/lib/cart";
import { cartFailurePolicy, SerialQueue } from "@/lib/cart-lifecycle";

type CartPayload = { cart?: StoreCart; code?: string; message?: string; [key: string]: unknown };
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
  cartAction: (action: string, data?: Record<string, unknown>) => Promise<CartPayload | null>;
};
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<StoreCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const version = useRef(0);
  const queue = useRef(new SerialQueue());

  const failure = useCallback((status: number, payload: CartPayload) => {
    const policy = cartFailurePolicy(status, payload.code);
    if (policy !== "preserve") {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      setCart(null);
    }
    setError(payload.message ?? "Não foi possível acessar o carrinho. Tente novamente.");
  }, []);

  const refreshCart = useCallback(async () => {
    const id = window.localStorage.getItem(CART_STORAGE_KEY);
    const revision = ++version.current;
    if (!id) { setCart(null); setIsLoading(false); return; }
    try {
      const response = await fetch(`/api/cart?cart_id=${encodeURIComponent(id)}`, { cache: "no-store", signal: AbortSignal.timeout(20000) });
      const payload: CartPayload = await response.json();
      if (revision !== version.current || id !== window.localStorage.getItem(CART_STORAGE_KEY)) return;
      if (!response.ok) { failure(response.status, payload); return; }
      setCart(payload.cart ?? null); setError("");
    } catch {
      if (revision === version.current) setError("Carrinho temporariamente indisponível. Seus itens foram preservados.");
    } finally { if (revision === version.current) setIsLoading(false); }
  }, [failure]);

  useEffect(() => {
    void refreshCart();
    const sessionChanged = () => { ++version.current; setCart(null); setError(""); setIsLoading(false); };
    const storage = (event: StorageEvent) => {
      if (event.key === "silva_session_changed") sessionChanged();
      if (event.key === CART_STORAGE_KEY || event.key === "silva_cart_changed") void refreshCart();
    };
    window.addEventListener("storage", storage);
    window.addEventListener("silva-session-changed", sessionChanged);
    return () => { ++version.current; window.removeEventListener("storage", storage); window.removeEventListener("silva-session-changed", sessionChanged); };
  }, [refreshCart]);

  // Invoked only inside the queue. Version checks suppress responses from an old
  // session or obsolete read, while Web Locks serialize mutations between tabs.
  const request = useCallback(async (action: string, data: Record<string, unknown> = {}) => {
    const revision = ++version.current;
    setError("");
    try {
      const response = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...data }), signal: AbortSignal.timeout(20000) });
      const payload: CartPayload = await response.json();
      if (revision !== version.current) return null;
      if (!response.ok) { failure(response.status, payload); return null; }
      if (payload.cart?.id) {
        window.localStorage.setItem(CART_STORAGE_KEY, payload.cart.id);
        setCart(payload.cart);
        window.localStorage.setItem("silva_cart_changed", crypto.randomUUID());
      }
      return payload;
    } catch {
      if (revision === version.current) setError("Não foi possível confirmar a alteração. Atualize o carrinho antes de tentar novamente.");
      return null;
    }
  }, [failure]);

  const serialize = useCallback(<T,>(operation: () => Promise<T>): Promise<T> => {
    return queue.current.run(async () => {
      if (navigator.locks) return await navigator.locks.request("silva-cart", operation);
      return await operation();
    });
  }, []);
  const run = useCallback((action: string, data: Record<string, unknown> = {}) => serialize(() => request(action, data)), [serialize, request]);
  const addToCart = useCallback((variantId: string, quantity = 1) => serialize(async () => {
    let id = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!id) id = (await request("create"))?.cart?.id ?? null;
    if (!id) return false;
    return Boolean(await request("add", { cartId: id, variant_id: variantId, quantity }));
  }), [serialize, request]);
  const removeItem = useCallback(async (lineItemId: string) => {
    const id = window.localStorage.getItem(CART_STORAGE_KEY);
    return id ? Boolean(await run("remove", { cartId: id, lineItemId })) : false;
  }, [run]);
  const updateQuantity = useCallback(async (lineItemId: string, quantity: number) => {
    if (quantity < 1) return removeItem(lineItemId);
    const id = window.localStorage.getItem(CART_STORAGE_KEY);
    return id ? Boolean(await run("update", { cartId: id, lineItemId, quantity })) : false;
  }, [run, removeItem]);
  const updateCart = useCallback(async (data: Record<string, unknown>) => {
    const id = window.localStorage.getItem(CART_STORAGE_KEY);
    return id ? Boolean(await run("update_cart", { cartId: id, data })) : false;
  }, [run]);
  const itemCount = useMemo(() => cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0, [cart]);
  return <CartContext.Provider value={{ cart, isLoading, error, itemCount, refreshCart, addToCart, updateQuantity, removeItem, updateCart, cartAction: run }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart precisa estar dentro de CartProvider");
  return value;
}
