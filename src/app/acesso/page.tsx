import Link from "next/link";
import { LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerLoginForm } from "@/components/customer-login-form";

export default function AcessoPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-8 lg:py-24">
      <div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Minha conta</p><h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Acesse seus pedidos.</h1><p className="mt-5 text-base leading-7 text-muted-foreground">Entre para consultar pedidos, endereços e dados da sua conta.</p><div className="mt-8 grid gap-4 text-sm text-muted-foreground"><p className="flex items-center gap-3"><UserRound className="size-5 text-gold" />Dados de acesso protegidos.</p><p className="flex items-center gap-3"><ShieldCheck className="size-5 text-gold" />Pedidos e endereços em um só lugar.</p></div></div>
      <Card><CardContent className="p-6 sm:p-8"><div className="flex items-center gap-3"><LockKeyhole className="size-5 text-gold" /><h2 className="text-xl font-semibold">Entrar</h2></div><CustomerLoginForm /><div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">Ainda não tem conta? <Link href="/contato" className="font-medium text-foreground hover:text-gold">Fale com a loja</Link></div></CardContent></Card>
    </main>
  );
}
