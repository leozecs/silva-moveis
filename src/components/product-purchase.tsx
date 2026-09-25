"use client";

import Link from "next/link";
import { useState } from "react";
import type { StorefrontVariant } from "@/lib/medusa";
import { money } from "@/lib/cart";
import { availability } from "@/lib/availability";
import { ProductAddToCart } from "@/components/product-add-to-cart";
import { getVariantColor } from "@/lib/product-colors";

export function ProductPurchase({ variants, options = [] }: { variants: StorefrontVariant[]; options?: Array<{ id: string; title: string }> }) {
  const [selected, setSelected] = useState(variants[0]?.id ?? "");
  const variant = variants.find((item) => item.id === selected);
  const stock = availability(variant);
  const price = variant?.calculated_price;
  const colors = variants.map((item) => ({ variant: item, color: getVariantColor(item, options) })).filter((item) => item.color !== null);
  return <div className="mt-5">
    {variants.length > 1 ? <div className="mb-5"><label htmlFor="product-variant" className="text-sm font-medium">Escolha uma opção</label><select id="product-variant" value={selected} onChange={(e) => setSelected(e.target.value)} className="mt-2 h-10 w-full rounded-lg border bg-background px-3">{variants.map((item, index) => <option value={item.id} key={item.id}>{item.title || `Opção ${index + 1}`}</option>)}</select></div> : null}
    <p className="text-2xl font-semibold">{price ? money(price.calculated_amount, price.currency_code) : "Preço indisponível"}</p>
    {colors.length > 0 && <fieldset className="mt-5"><legend className="text-sm font-medium">Cor: {variant && getVariantColor(variant, options)?.name}</legend><div className="mt-3 flex flex-wrap gap-3">{colors.map(({ variant: item, color }) => <button key={item.id} type="button" aria-label={`${color!.name}${item.title ? ` — ${item.title}` : ""}`} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)} className="flex min-h-11 items-center gap-2 rounded-full border px-3 py-2 text-sm aria-pressed:border-amber-700 aria-pressed:ring-2 aria-pressed:ring-amber-700/30"><span aria-hidden="true" className="size-6 rounded-full border border-black/20" style={{ backgroundColor: color!.hex ?? "transparent" }} />{color!.name}</button>)}</div></fieldset>}
    <p role="status" className="mt-3 text-sm text-muted-foreground">{stock.label}</p>
    <ProductAddToCart key={selected} variantId={variant?.id} disabled={!stock.purchasable || !price} />
    <p className="mt-3 text-center text-xs text-muted-foreground"><Link href="/acesso" className="underline">Entre na sua conta</Link> para adicionar produtos e acompanhar sua compra.</p>
  </div>;
}
