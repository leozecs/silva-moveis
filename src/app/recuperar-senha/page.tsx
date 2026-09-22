"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setLoading(true); setError(""); const response = await fetch("/api/auth/password-reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); const payload = await response.json().catch(() => null); if (!response.ok) setError(payload?.message ?? "Não foi possível enviar o e-mail."); else setSent(true); setLoading(false); }
  return <main className="mx-auto max-w-md px-4 py-16"><Link href="/acesso" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" />Voltar para acesso</Link><Card className="mt-8"><CardContent className="p-7"><h1 className="text-2xl font-semibold">Recuperar senha</h1>{sent ? <p className="mt-4 text-sm leading-6 text-muted-foreground">Se existir uma conta com este e-mail, enviaremos instruções para criar uma nova senha.</p> : <form onSubmit={submit} className="mt-6 grid gap-4"><label className="grid gap-2 text-sm font-medium">E-mail<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>{error ? <p className="text-sm text-destructive">{error}</p> : null}<Button disabled={loading}>{loading ? "Enviando..." : "Enviar instruções"}</Button></form>}</CardContent></Card></main>;
}
