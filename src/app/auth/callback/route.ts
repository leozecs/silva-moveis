import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { isMerchantEmail } from "@/lib/merchant-session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookie = (await cookies()).get("silva_google_state")?.value;
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  function finish(path: string, token?: string) {
    const result = NextResponse.redirect(new URL(path, url.origin));
    result.cookies.set("silva_google_state", "", { path: "/auth/callback", maxAge: 0 });
    result.headers.set("Cache-Control", "no-store");
    result.headers.set("Referrer-Policy", "no-referrer");
    if (token) {
      result.cookies.set("medusa_customer_token", token, { path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 86400 });
      result.cookies.set("medusa_merchant_token", "", { path: "/", httpOnly: true, maxAge: 0 });
    }
    return result;
  }
  if (!cookie || !state || !/^[a-f0-9]{64}$/i.test(cookie) || !/^[a-f0-9]{64}$/i.test(state) || !code || code.length > 4096 || !timingSafeEqual(Buffer.from(cookie), Buffer.from(state))) return finish("/acesso?erro=google");
  const base = (process.env.MEDUSA_BACKEND_URL ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)?.replace(/\/$/, "");
  if (!base) return finish("/acesso?erro=google");
  try {
    const callback = await fetch(`${base}/auth/customer/google/callback?${new URLSearchParams({ code, state })}`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
    const payload = await callback.json();
    if (!callback.ok || !payload.token || payload.mfa_required || payload.verification_required) return finish("/acesso?erro=google");
    let token: string = payload.token;
    // This token comes directly from the trusted Medusa callback, never from
    // browser input. Medusa authorizes all subsequent customer operations.
    const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    const email = claims.user_metadata?.email;
    if (claims.actor_type !== "customer" || typeof email !== "string" || isMerchantEmail(email)) return finish("/acesso?erro=google");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "" };
    if (!claims.actor_id) {
      const created = await fetch(`${base}/store/customers`, { method: "POST", headers, body: JSON.stringify({ email, first_name: claims.user_metadata?.given_name ?? "", last_name: claims.user_metadata?.family_name ?? "" }), cache: "no-store", signal: AbortSignal.timeout(15000) });
      if (!created.ok) return finish("/acesso?erro=google");
      const refreshed = await fetch(`${base}/auth/token/refresh`, { method: "POST", headers, cache: "no-store", signal: AbortSignal.timeout(15000) });
      const result = await refreshed.json();
      if (!refreshed.ok || !result.token) return finish("/acesso?erro=google");
      token = result.token;
    }
    const customer = await fetch(`${base}/store/customers/me`, { headers: { ...headers, Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!customer.ok) return finish("/acesso?erro=google");
    return finish("/minha-conta", token);
  } catch { return finish("/acesso?erro=google"); }
}
