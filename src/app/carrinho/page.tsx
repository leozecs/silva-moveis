import Image from "next/image";
import Link from "next/link";
import { CreditCard, LockKeyhole, Minus, Plus, ShieldCheck, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cartItems, formatCurrency } from "@/lib/data";

export const metadata = {
  title: "Carrinho | Silva Moveis",
  description: "Carrinho visual demonstrativo com integracao futura Mercado Pago.",
};

export default function CarrinhoPage() {
  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const shipping = 490;
  const discount = 850;
  const total = subtotal + shipping - discount;

  return (
    <section className="bg-ivory pt-32">
      <div className="container-premium py-16">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="rounded-sm bg-white text-gold-foreground shadow-sm">
              Carrinho de compras
            </Badge>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight">
              Revise seus produtos antes do checkout.
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Fluxo visual mockado para demonstrar como a compra funcionara apos
              o cadastro do cliente.
            </p>
          </div>
          <Link
            href="/acesso"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-white px-5 text-sm font-semibold transition hover:border-gold"
          >
            Entrar antes de comprar
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="grid gap-4">
            {cartItems.map((item) => (
              <Card key={item.product.slug} className="rounded-md bg-white shadow-sm">
                <CardContent className="grid gap-5 p-5 sm:grid-cols-[160px_1fr_auto]">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="180px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-gold">
                      {item.product.collection}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      {item.product.name}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.product.shortDescription}
                    </p>
                    <div className="mt-4 inline-flex items-center rounded-md border border-border">
                      <Button variant="ghost" size="icon-sm" aria-label="Diminuir">
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="min-w-10 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <Button variant="ghost" size="icon-sm" aria-label="Aumentar">
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-muted-foreground">Preco unitario</p>
                    <p className="mt-1 text-lg font-semibold">
                      {item.product.priceLabel}
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground">Subtotal</p>
                    <p className="mt-1 text-xl font-semibold text-gold">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <aside className="h-fit rounded-md border border-border bg-white p-6 shadow-xl lg:sticky lg:top-28">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-full bg-graphite text-gold">
                <ShoppingCart className="size-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Resumo da compra</h2>
                <p className="text-sm text-muted-foreground">
                  Valores ficticios para demonstracao.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entrega premium</span>
                <span className="font-medium">{formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between text-green-700">
                <span>Desconto demonstrativo</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            </div>

            <Separator className="my-5" />

            <div className="flex items-end justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-3xl font-semibold">{formatCurrency(total)}</span>
            </div>

            <Button className="mt-6 h-12 w-full rounded-md" type="button">
              <CreditCard className="size-4" />
              Finalizar com Mercado Pago
            </Button>

            <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-gold" />
                Pagamento futuro com Pix, cartao e boleto.
              </span>
              <span className="flex items-center gap-2">
                <LockKeyhole className="size-4 text-gold" />
                Checkout liberado apos login/cadastro.
              </span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
