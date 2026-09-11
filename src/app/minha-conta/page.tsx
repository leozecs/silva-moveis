import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Package, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerLogoutButton } from "@/components/customer-logout-button";
import { getStorefrontCustomer } from "@/lib/medusa";

export default async function MinhaContaPage() {
  const token = (await cookies()).get("medusa_customer_token")?.value;
  const customer = token ? await getStorefrontCustomer(token) : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
        Área do cliente
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        Minha conta.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
        Consulte pedidos, dados de entrega e informações da sua conta.
      </p>

      <Card className="mt-10 max-w-2xl">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <UserRound className="mt-1 size-5 text-gold" />
            <div>
              {customer ? (
                <>
                  <p className="font-semibold">
                    {customer.first_name || customer.email}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {customer.email}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold">Nenhuma sessão ativa</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Entre para acessar os dados da sua conta.
                  </p>
                </>
              )}
            </div>
          </div>
          {customer ? (
            <CustomerLogoutButton />
          ) : (
            <Link
              href="/acesso"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
            >
              Entrar
              <ArrowRight className="size-4" />
            </Link>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <Package className="size-5 text-gold" />
            <h2 className="mt-4 font-semibold">Pedidos</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Seus pedidos aparecerão aqui.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <UserRound className="size-5 text-gold" />
            <h2 className="mt-4 font-semibold">Dados pessoais</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Seus dados aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
