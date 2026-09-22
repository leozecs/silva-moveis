"use client";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/components/storefront-analytics";

export function ProductAddToCart({ variantId, disabled }: { variantId?: string; disabled?: boolean }) {
  const { addToCart, error } = useCart(); const [added, setAdded] = useState(false); const [loading, setLoading] = useState(false);
  async function handleAdd() { if (!variantId) return; setLoading(true); setAdded(false); const ok = await addToCart(variantId); if (ok) trackEvent("add_to_cart", { variant_id: variantId, quantity: 1 }); setAdded(ok); setLoading(false); }
  return <><Button className="mt-6 w-full" size="lg" disabled={disabled || loading || !variantId} onClick={handleAdd}><ShoppingCart className="size-4" />{loading ? "Adicionando..." : added ? "Adicionado ao carrinho" : "Adicionar ao carrinho"}</Button>{error ? <p role="alert" className="mt-3 text-center text-xs text-destructive">{error}</p> : added ? <p className="mt-3 text-center text-xs text-muted-foreground">Você pode revisar seu pedido no carrinho.</p> : null}</>;
}
