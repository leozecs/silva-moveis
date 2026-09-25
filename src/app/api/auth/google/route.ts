import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/http-policy";
import { storeFailure } from "@/lib/store-server";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const base = (process.env.MEDUSA_BACKEND_URL ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)?.replace(/\/$/, "");
    if (!base) return NextResponse.json({ message: "O acesso com Google ainda não está disponível." }, { status: 503 });
    const origin = new URL(request.url).origin;
    const response = await fetch(`${base}/auth/customer/google`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ callback_url: `${origin}/auth/callback` }), cache: "no-store", signal: AbortSignal.timeout(15000) });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.location) return NextResponse.json({ message: "O acesso com Google ainda não está disponível. Use e-mail e senha." }, { status: 503 });
    const location = new URL(payload.location);
    const state = location.searchParams.get("state");
    if (location.origin !== "https://accounts.google.com" || !state || state.length > 256) throw new Error("Invalid OAuth redirect");
    const result = NextResponse.json({ location: location.href });
    result.cookies.set("silva_google_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/auth/callback", maxAge: 600 });
    return result;
  } catch (error) { return storeFailure(error); }
}
