import { BrandLogo } from "@/components/brand-logo";
import { CustomerLoginForm } from "@/components/customer-login-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function AcessoPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return <main className="min-h-[calc(100vh-7rem)] px-4 py-12 sm:px-6 lg:py-20"><div className="mx-auto max-w-md"><Card className="border-black/10 shadow-sm"><CardContent className="p-6 sm:p-9"><div className="flex justify-center"><BrandLogo /></div><p className="mt-8 text-center text-xs font-semibold uppercase tracking-[0.28em] text-gold">Área do cliente</p><h1 className="mt-3 text-center font-serif text-3xl font-semibold tracking-tight">Entre ou crie sua conta</h1><p className="mt-3 text-center text-sm leading-6 text-muted-foreground">Acompanhe pedidos, salve seus endereços e compre com mais praticidade.</p><CustomerLoginForm initialError={erro === "google" ? "Não foi possível concluir o acesso com Google. Tente novamente ou entre com e-mail e senha." : ""} /></CardContent></Card></div></main>;
}
