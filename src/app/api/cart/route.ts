import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const backendUrl = (process.env.MEDUSA_BACKEND_URL ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)?.replace(/\/$/, "");
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
const regionId = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID;

async function medusa(path: string, init: RequestInit = {}) {
  if (!backendUrl) throw new Error("A loja ainda não está disponível.");
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (publishableKey) headers.set("x-publishable-api-key", publishableKey);
  const token = (await cookies()).get("medusa_customer_token")?.value;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${backendUrl}${path}`, { ...init, headers, cache: "no-store" });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message ?? payload?.type ?? "Não foi possível concluir a operação.");
  return payload;
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("cart_id");
  if (!id) return NextResponse.json({ cart: null });
  try { return NextResponse.json(await medusa(`/store/carts/${id}`)); }
  catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Carrinho indisponível." }, { status: 502 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { action?: string; cartId?: string; lineItemId?: string; variant_id?: string; quantity?: number; data?: Record<string, unknown>; provider_id?: string; shipping_option_id?: string };
    const action = body.action;
    let payload;
    if (action === "create") payload = await medusa("/store/carts", { method: "POST", body: JSON.stringify({ region_id: regionId }) });
    else if (action === "add") payload = await medusa(`/store/carts/${body.cartId}/line-items`, { method: "POST", body: JSON.stringify({ variant_id: body.variant_id, quantity: body.quantity ?? 1 }) });
    else if (action === "update") payload = await medusa(`/store/carts/${body.cartId}/line-items/${body.lineItemId}`, { method: "POST", body: JSON.stringify({ quantity: body.quantity }) });
    else if (action === "remove") payload = await medusa(`/store/carts/${body.cartId}/line-items/${body.lineItemId}`, { method: "DELETE" });
    else if (action === "update_cart") payload = await medusa(`/store/carts/${body.cartId}`, { method: "POST", body: JSON.stringify(body.data ?? {}) });
    else if (action === "shipping_options") payload = await medusa(`/store/shipping-options?cart_id=${encodeURIComponent(body.cartId ?? "")}`);
    else if (action === "add_shipping") payload = await medusa(`/store/carts/${body.cartId}/shipping-methods`, { method: "POST", body: JSON.stringify({ option_id: body.shipping_option_id }) });
    else if (action === "payment_collection") payload = await medusa("/store/payment-collections", { method: "POST", body: JSON.stringify({ cart_id: body.cartId }) });
    else if (action === "payment_session") payload = await medusa(`/store/payment-collections/${body.data?.collectionId}/payment-sessions`, { method: "POST", body: JSON.stringify({ provider_id: body.provider_id }) });
    else if (action === "complete") payload = await medusa(`/store/carts/${body.cartId}/complete`, { method: "POST", body: JSON.stringify({}) });
    else return NextResponse.json({ message: "Operação inválida." }, { status: 400 });
    return NextResponse.json(payload);
  } catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Não foi possível atualizar o carrinho." }, { status: 502 }); }
}
