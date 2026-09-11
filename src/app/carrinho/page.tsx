import Link from "next/link";
import { ArrowRight, LockKeyhole, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CarrinhoPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
      <div className="flex items-center gap-3"><ShoppingCart className="size-6 text-gold" /><p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Carrinho</p></div>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Seu carrinho está vazio.</h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">Adicione produtos do catálogo para continuar. Estoque, valores e checkout serão conectados à operação da loja pela Medusa.</p>
      <Card className="mt-10 max-w-xl"><CardContent className="p-6"><div className="flex items-start gap-4"><LockKeyhole className="mt-1 size-5 text-gold" /><div><p className="font-semibold">Checkout seguro</p><p className="mt-1 text-sm leading-6 text-muted-foreground">O processamento de pedidos e pagamentos ficará disponível quando o backend estiver configurado.</p></div></div><Link href="/catalogo" className="mt-6 inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/80">Explorar catálogo<ArrowRight className="size-4" /></Link></CardContent></Card>
    </main>
  );
}
