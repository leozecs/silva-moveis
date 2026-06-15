import Link from "next/link";
import { PackageCheck, ReceiptText, ShoppingBag, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, purchaseHistory } from "@/lib/data";

export const metadata = {
  title: "Minha Conta | Silva Moveis",
  description: "Painel visual de historico de compras da Silva Moveis.",
};

export default function MinhaContaPage() {
  return (
    <section className="bg-ivory pt-32">
      <div className="container-premium py-16">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded-md border border-border bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <div className="grid size-14 place-items-center rounded-full bg-graphite text-gold">
              <UserRound className="size-7" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold">Juliana Silva</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              cliente.demo@silvamoveis.com.br
            </p>
            <Separator className="my-5" />
            <div className="grid gap-2 text-sm">
              <Link className="rounded-md bg-ivory px-3 py-2 font-medium" href="/minha-conta">
                Historico de compras
              </Link>
              <Link className="rounded-md px-3 py-2 text-muted-foreground" href="/carrinho">
                Carrinho atual
              </Link>
              <Link className="rounded-md px-3 py-2 text-muted-foreground" href="/catalogo">
                Comprar novamente
              </Link>
            </div>
          </aside>

          <div>
            <Badge className="rounded-sm bg-white text-gold-foreground shadow-sm">
              Painel do cliente
            </Badge>
            <h2 className="mt-4 text-5xl font-semibold tracking-tight">
              Historico de compras e pedidos.
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Dados mockados para mostrar como o cliente acompanhara compras,
              status e pagamentos apos entrar na loja.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: ShoppingBag, label: "Pedidos", value: "3" },
                { icon: PackageCheck, label: "Em andamento", value: "2" },
                { icon: ReceiptText, label: "Total comprado", value: "R$ 52.790" },
              ].map((item) => (
                <Card key={item.label} className="rounded-md bg-white shadow-sm">
                  <CardContent className="p-5">
                    <item.icon className="size-5 text-gold" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 grid gap-4">
              {purchaseHistory.map((order) => (
                <Card key={order.id} className="rounded-md bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-gold">
                          Pedido {order.id}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold">
                          {order.items.join(" + ")}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Compra em {order.date} via {order.payment}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <Badge className="rounded-sm bg-ivory text-gold-foreground">
                          {order.status}
                        </Badge>
                        <p className="mt-3 text-2xl font-semibold">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
