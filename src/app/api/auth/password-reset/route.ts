import { NextResponse } from "next/server";
const backendUrl = (process.env.MEDUSA_BACKEND_URL ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)?.replace(/\/$/, "");
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; token?: string; password?: string } | null;
  if (!backendUrl) return NextResponse.json({ message: "Recuperação ainda não disponível." }, { status: 503 });
  try {
    const isUpdate = Boolean(body?.token && body?.password);
    const response = await fetch(`${backendUrl}/auth/customer/emailpass/${isUpdate ? "update" : "reset-password"}`, { method: "POST", headers: { "Content-Type": "application/json", ...(isUpdate ? { Authorization: `Bearer ${body?.token}` } : {}) }, body: JSON.stringify(isUpdate ? { email: body?.email, password: body?.password } : { identifier: body?.email }), cache: "no-store" });
    if (!response.ok && !(!isUpdate && response.status === 201)) { const payload = await response.json().catch(() => null); return NextResponse.json({ message: payload?.message ?? "Não foi possível processar a solicitação." }, { status: response.status }); }
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ message: "Não foi possível conectar à recuperação de senha." }, { status: 502 }); }
}
