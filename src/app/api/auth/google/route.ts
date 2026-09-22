import { NextResponse } from "next/server";
const backendUrl = (process.env.MEDUSA_BACKEND_URL ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)?.replace(/\/$/, "");
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
export async function POST(request: Request) {
  if (!backendUrl) return NextResponse.json({ message: "O acesso com Google ainda não está disponível." }, { status: 503 });
  const origin = new URL(request.url).origin;
  try { const response = await fetch(`${backendUrl}/auth/customer/google`, { method: "POST", headers: { "Content-Type": "application/json", ...(publishableKey ? { "x-publishable-api-key": publishableKey } : {}) }, body: JSON.stringify({ callback_url: `${origin}/auth/callback` }), cache: "no-store" }); const payload = await response.json().catch(() => null); return NextResponse.json(payload ?? { message: "Não foi possível iniciar o acesso com Google." }, { status: response.status }); } catch { return NextResponse.json({ message: "Não foi possível iniciar o acesso com Google." }, { status: 502 }); }
}
