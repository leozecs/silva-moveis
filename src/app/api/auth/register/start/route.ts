import { NextResponse } from "next/server";
import { resend, emailFrom } from "@/lib/resend";
import { createRegistrationChallenge } from "@/lib/auth-code";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { name?: string; email?: string; password?: string; password_confirmation?: string } | null;
  if (!body?.name || !body.email || !body.password) return NextResponse.json({ message: "Preencha todos os campos." }, { status: 400 });
  if (body.password !== body.password_confirmation) return NextResponse.json({ message: "As senhas não coincidem." }, { status: 400 });
  if (body.password.length < 8) return NextResponse.json({ message: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
  if (!resend) return NextResponse.json({ message: "Confirmação por e-mail ainda não está configurada." }, { status: 503 });
  const { code, cookie } = createRegistrationChallenge({ name: body.name.trim(), email: body.email.trim().toLowerCase(), password: body.password });
  const sent = await resend.emails.send({ from: emailFrom, to: body.email, subject: "Confirme seu cadastro na Silva Móveis", html: `<p>Seu código de confirmação é:</p><p style="font-size:28px;font-weight:700;letter-spacing:8px">${code}</p><p>Ele expira em 15 minutos.</p>` });
  if (sent.error) return NextResponse.json({ message: "Não foi possível enviar o código de confirmação." }, { status: 502 });
  const response = NextResponse.json({ requiresVerification: true }); response.cookies.set("silva_pending_registration", cookie, { httpOnly: true, maxAge: 900, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" }); return response;
}
