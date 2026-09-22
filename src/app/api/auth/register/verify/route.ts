import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readRegistrationChallenge } from "@/lib/auth-code";

const backendUrl = (process.env.MEDUSA_BACKEND_URL ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)?.replace(/\/$/, "");
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { code?: string } | null; const pending = readRegistrationChallenge((await cookies()).get("silva_pending_registration")?.value, body?.code ?? "");
  if (!pending) return NextResponse.json({ message: "Código inválido ou expirado." }, { status: 400 });
  if (!backendUrl) return NextResponse.json({ message: "A criação de conta ainda não está disponível." }, { status: 503 });
  try {
    const registration = await fetch(`${backendUrl}/auth/customer/emailpass/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: pending.email, password: pending.password }), cache: "no-store" }); const registrationPayload = await registration.json().catch(() => null) as { token?: string; message?: string } | null;
    if (!registration.ok || !registrationPayload?.token) return NextResponse.json({ message: registrationPayload?.message ?? "Não foi possível criar sua conta." }, { status: registration.status || 400 });
    const parts = pending.name.split(/\s+/); const first_name = parts.shift() ?? pending.name; const last_name = parts.join(" "); const customer = await fetch(`${backendUrl}/store/customers`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${registrationPayload.token}`, ...(publishableKey ? { "x-publishable-api-key": publishableKey } : {}) }, body: JSON.stringify({ email: pending.email, first_name, last_name }), cache: "no-store" }); const customerPayload = await customer.json().catch(() => null) as { token?: string; message?: string } | null;
    if (!customer.ok) return NextResponse.json({ message: customerPayload?.message ?? "Não foi possível concluir seu cadastro." }, { status: customer.status });
    const result = NextResponse.json({ ok: true }); result.cookies.set("medusa_customer_token", customerPayload?.token ?? registrationPayload.token, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" }); result.cookies.set("silva_pending_registration", "", { expires: new Date(0), path: "/" }); return result;
  } catch { return NextResponse.json({ message: "Não foi possível concluir seu cadastro." }, { status: 502 }); }
}
