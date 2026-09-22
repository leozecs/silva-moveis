import { NextResponse } from "next/server";
const backendUrl = (process.env.MEDUSA_BACKEND_URL ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)?.replace(/\/$/, "");
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
export async function POST(request: Request) {
  if (!backendUrl) return NextResponse.json({ message: "A criação de conta ainda não está disponível." }, { status: 503 });
  const body = await request.json().catch(() => null) as { name?: string; email?: string; password?: string; password_confirmation?: string } | null;
  if (!body?.name || !body.email || !body.password) return NextResponse.json({ message: "Preencha todos os campos." }, { status: 400 });
  if (body.password !== body.password_confirmation) return NextResponse.json({ message: "As senhas não coincidem." }, { status: 400 });
  if (body.password.length < 8) return NextResponse.json({ message: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
  try {
    const registration = await fetch(`${backendUrl}/auth/customer/emailpass/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: body.email, password: body.password }), cache: "no-store" });
    const registrationPayload = await registration.json().catch(() => null) as { token?: string; message?: string } | null;
    if (!registration.ok || !registrationPayload?.token) return NextResponse.json({ message: registrationPayload?.message ?? "Não foi possível criar sua conta." }, { status: registration.status || 400 });
    const parts = body.name.trim().split(/\s+/); const first_name = parts.shift() ?? body.name; const last_name = parts.join(" ");
    const customer = await fetch(`${backendUrl}/store/customers`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${registrationPayload.token}`, ...(publishableKey ? { "x-publishable-api-key": publishableKey } : {}) }, body: JSON.stringify({ email: body.email, first_name, last_name }), cache: "no-store" });
    const customerPayload = await customer.json().catch(() => null) as { token?: string; message?: string } | null;
    if (!customer.ok) return NextResponse.json({ message: customerPayload?.message ?? "Não foi possível concluir seu cadastro." }, { status: customer.status });
    const result = NextResponse.json({ ok: true }); result.cookies.set("medusa_customer_token", customerPayload?.token ?? registrationPayload.token, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" }); return result;
  } catch { return NextResponse.json({ message: "Não foi possível conectar à criação de conta." }, { status: 502 }); }
}
