import { NextResponse } from "next/server";

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
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ message: "Dados de acesso inválidos." }, { status: 400 });
  }

  if (!body.email || !body.password) {
    return NextResponse.json(
      { message: "Informe e-mail e senha." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${backendUrl}/auth/customer/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as
      | { token?: string; message?: string }
      | null;

    if (!response.ok || !payload?.token) {
      return NextResponse.json(
        { message: payload?.message ?? "Não foi possível entrar com esses dados." },
        { status: response.ok ? 401 : response.status },
      );
    }

    const result = NextResponse.json({ ok: true });
    result.cookies.set("medusa_customer_token", payload.token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return result;
  } catch {
    return NextResponse.json(
      { message: "Não foi possível conectar à autenticação da loja." },
      { status: 502 },
    );
  }
}
