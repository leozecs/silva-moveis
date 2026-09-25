import { NextResponse } from "next/server";
import { getMerchantSession, isMerchantEmail } from "@/lib/merchant-session";
import { assertSameOrigin, readJsonObject } from "@/lib/http-policy";

const backendUrl =
  process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.replace(/\/$/, "");

export async function POST(request: Request) {
  if (!backendUrl) {
    return NextResponse.json(
      { message: "A autenticação da loja ainda não foi configurada." },
      { status: 503 },
    );
  }

  let body: { email?: string; password?: string };

  try {
    assertSameOrigin(request);
    body = await readJsonObject(request) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ message: "Dados de acesso inválidos." }, { status: 400 });
  }

  if (typeof body.email !== "string" || typeof body.password !== "string" || !body.email || !body.password) {
    return NextResponse.json(
      { message: "Informe e-mail e senha." },
      { status: 400 },
    );
  }

  try {
    const merchant = isMerchantEmail(body.email);
    const response = await fetch(`${backendUrl}/auth/${merchant ? "user" : "customer"}/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email.trim().toLowerCase(), password: body.password }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    const payload = (await response.json().catch(() => null)) as
      | { token?: string; message?: string }
      | null;

    if (!response.ok || !payload?.token) {
      return NextResponse.json(
        { message: "Não foi possível entrar com esses dados." },
        { status: response.ok ? 401 : response.status },
      );
    }

    if (merchant && !await getMerchantSession(payload.token)) return NextResponse.json({ message: "Acesso de lojista não autorizado." }, { status: 403 });
    const result = NextResponse.json({ ok: true, href: merchant ? "/admin" : "/minha-conta" });
    result.cookies.set(merchant ? "medusa_merchant_token" : "medusa_customer_token", payload.token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    result.cookies.set(merchant ? "medusa_customer_token" : "medusa_merchant_token", "", { expires: new Date(0), path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });

    return result;
  } catch {
    return NextResponse.json(
      { message: "Não foi possível conectar à autenticação da loja." },
      { status: 502 },
    );
  }
}
