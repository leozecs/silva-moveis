import {
  BarChart3,
  Boxes,
  CircleDollarSign,
  CreditCard,
  FileBarChart,
  Gift,
  ImageIcon,
  LayoutDashboard,
  PackageCheck,
  PackagePlus,
  Percent,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Truck,
  UserRoundCog,
  UsersRound,
} from "lucide-react";
import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Painel Admin Teste | Silva Moveis",
  description: "Painel administrativo demonstrativo sem login.",
};

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Produtos", icon: PackagePlus },
  { label: "Categorias", icon: Tags },
  { label: "Clientes", icon: UsersRound },
  { label: "Pedidos", icon: PackageCheck },
  { label: "Banners", icon: ImageIcon },
  { label: "Cupons", icon: Gift },
  { label: "Estoque", icon: Boxes },
  { label: "Vendas", icon: BarChart3 },
  { label: "Financeiro", icon: CircleDollarSign },
];

const metrics = [
  {
    label: "Faturamento do mes",
    value: "R$ 184.920",
    change: "+18,4%",
    icon: CircleDollarSign,
  },
  {
    label: "Pedidos em aberto",
    value: "37",
    change: "12 hoje",
    icon: PackageCheck,
  },
  {
    label: "Ticket medio",
    value: "R$ 8.740",
    change: "+7,1%",
    icon: ReceiptText,
  },
  {
    label: "Itens com baixo estoque",
    value: "9",
    change: "acao necessaria",
    icon: Boxes,
  },
];

const ecommerceFlows = [
  {
    title: "Carrinho",
    icon: ShoppingCart,
    status: "Pronto para integrar",
    items: [
      "Adicionar/remover itens",
      "Alterar quantidades",
      "Simulacao de frete",
      "Resumo do pedido",
    ],
  },
  {
    title: "Checkout",
    icon: CreditCard,
    status: "Mercado Pago futuro",
    items: [
      "Cadastro de endereco",
      "Frete",
      "PIX",
      "Cartao de credito",
      "Boleto",
      "Confirmacao de pedido",
    ],
  },
  {
    title: "Area do Cliente",
    icon: UserRoundCog,
    status: "Base para pos-login",
    items: [
      "Historico de pedidos",
      "Status dos pedidos",
      "Enderecos salvos",
      "Dados pessoais",
      "Alteracao de senha",
    ],
  },
];

const adminModules = [
  {
    title: "Gestao de produtos",
    icon: PackagePlus,
    description:
      "Cadastro, edicao, status, destaque, imagens, precos e especificacoes.",
    count: "126 produtos",
  },
  {
    title: "Gestao de categorias",
    icon: Tags,
    description:
      "Organizacao do catalogo por sofas, poltronas, gourmet, piscina e mesas.",
    count: "8 categorias",
  },
  {
    title: "Gestao de clientes",
    icon: UsersRound,
    description:
      "Cadastro, enderecos, contatos, historico e classificacao comercial.",
    count: "842 clientes",
  },
  {
    title: "Gestao de pedidos",
    icon: PackageCheck,
    description:
      "Acompanhamento de pedido, pagamento, producao, entrega e pos-venda.",
    count: "37 ativos",
  },
  {
    title: "Gestao de banners",
    icon: ImageIcon,
    description:
      "Controle de banners da home, campanhas, categorias e vitrines sazonais.",
    count: "5 ativos",
  },
  {
    title: "Gestao de cupons",
    icon: Percent,
    description:
      "Cupons promocionais, regras de desconto, validade e limite de uso.",
    count: "12 cupons",
  },
  {
    title: "Controle de estoque",
    icon: Boxes,
    description:
      "Disponibilidade, estoque minimo, reserva de pedido e alertas de reposicao.",
    count: "9 alertas",
  },
  {
    title: "Relatorios de vendas",
    icon: BarChart3,
    description:
      "Vendas por periodo, categoria, ticket medio, conversao e produtos campeoes.",
    count: "mensal",
  },
  {
    title: "Relatorios financeiros",
    icon: FileBarChart,
    description:
      "Recebimentos, taxas do Mercado Pago, frete, cupons e conciliação futura.",
    count: "financeiro",
  },
];

const orders = [
  {
    id: "SM-2048",
    customer: "Juliana Prado",
    items: "Sofa Verona + 2 Poltronas Milano",
    status: "Pagamento aprovado",
    total: "R$ 22.680",
  },
  {
    id: "SM-2047",
    customer: "Condominio Reserva Alta",
    items: "Conjunto Piscina Riviera",
    status: "Aguardando frete",
    total: "R$ 24.600",
  },
  {
    id: "SM-2046",
    customer: "Arq. Renata Prado",
    items: "Mesa Aurora + 8 Cadeiras Alba",
    status: "Em producao",
    total: "R$ 22.510",
  },
  {
    id: "SM-2045",
    customer: "Marina Costa",
    items: "Espreguicadeira Solare",
    status: "Pedido entregue",
    total: "R$ 5.290",
  },
];

const products = [
  {
    name: "Sofa Externo Verona",
    category: "Sofas externos",
    stock: "8 un.",
    price: "R$ 12.900",
    status: "Ativo",
  },
  {
    name: "Poltrona Nautica Milano",
    category: "Poltronas",
    stock: "14 un.",
    price: "R$ 4.890",
    status: "Destaque",
  },
  {
    name: "Conjunto Gourmet Lago",
    category: "Gourmet",
    stock: "3 un.",
    price: "R$ 18.750",
    status: "Baixo estoque",
  },
  {
    name: "Conjunto Piscina Riviera",
    category: "Piscina",
    stock: "2 un.",
    price: "R$ 24.600",
    status: "Sob demanda",
  },
];

const salesBars = [
  { label: "Jan", value: "42%" },
  { label: "Fev", value: "58%" },
  { label: "Mar", value: "47%" },
  { label: "Abr", value: "73%" },
  { label: "Mai", value: "86%" },
  { label: "Jun", value: "64%" },
];

export default function AdminPage() {
  return (
    <section className="bg-ivory pt-24">
      <div className="container-premium py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-md border border-border bg-white p-4 shadow-sm lg:sticky lg:top-28">
            <div className="rounded-md bg-graphite p-5 text-white">
              <p className="text-xs uppercase tracking-[0.28em] text-gold">
                Silva Moveis
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight">
                Admin teste
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/62">
                Painel sem login, com dados mockados e estrutura preparada para
                a loja completa.
              </p>
            </div>

            <nav className="mt-4 grid gap-1" aria-label="Admin">
              {sidebarItems.map((item, index) => (
                <a
                  key={item.label}
                  href={`#${item.label.toLowerCase()}`}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                    index === 0
                      ? "bg-ivory font-semibold text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="size-4 text-gold" />
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          <main className="grid gap-6">
            <div className="rounded-md border border-border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <Badge className="rounded-sm bg-ivory text-gold-foreground">
                    Base administrativa profissional
                  </Badge>
                  <h2 className="mt-4 text-4xl font-semibold tracking-tight lg:text-5xl">
                    Visao geral da operacao da loja virtual.
                  </h2>
                  <p className="mt-4 max-w-3xl text-muted-foreground">
                    Este painel ja antecipa a estrutura que sera ligada ao
                    backend: carrinho, checkout, area do cliente, catalogo,
                    pedidos, estoque e relatorios.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-md">
                    Exportar relatorio
                  </Button>
                  <Button className="rounded-md">
                    Novo produto
                  </Button>
                </div>
              </div>
            </div>

            <section id="dashboard" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <Card key={metric.label} className="rounded-md bg-white shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid size-11 place-items-center rounded-full bg-graphite text-gold">
                        <metric.icon className="size-5" />
                      </div>
                      <Badge className="rounded-sm bg-ivory text-gold-foreground">
                        {metric.change}
                      </Badge>
                    </div>
                    <p className="mt-5 text-sm text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="mt-1 text-3xl font-semibold">{metric.value}</p>
                  </CardContent>
                </Card>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="rounded-md bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        Relatorio de vendas
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Evolucao mockada para demonstrar dashboards futuros.
                      </p>
                    </div>
                    <BarChart3 className="size-5 text-gold" />
                  </div>

                  <div className="mt-8 flex h-64 items-end gap-4 border-b border-border pb-4">
                    {salesBars.map((bar) => (
                      <div key={bar.label} className="flex flex-1 flex-col items-center gap-3">
                        <div className="flex h-52 w-full items-end rounded-md bg-ivory p-1">
                          <div
                            className="w-full rounded-sm bg-gold"
                            style={{ height: bar.value }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {bar.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-md bg-graphite text-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="size-6 text-gold" />
                    <h3 className="text-xl font-semibold">Checkout futuro</h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-white/65">
                    A base visual ja contempla Mercado Pago com PIX, cartao de
                    credito e boleto, alem de confirmacao de pedido.
                  </p>
                  <Separator className="my-6 bg-white/10" />
                  <div className="grid gap-3 text-sm">
                    {[
                      "Cadastro de endereco",
                      "Simulacao de frete",
                      "Resumo do pedido",
                      "Pagamento Mercado Pago",
                      "Confirmacao de pedido",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <span className="size-2 rounded-full bg-gold" />
                        <span className="text-white/78">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
              {ecommerceFlows.map((flow) => (
                <Card key={flow.title} className="rounded-md bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid size-11 place-items-center rounded-full bg-ivory text-gold">
                        <flow.icon className="size-5" />
                      </div>
                      <Badge variant="outline" className="rounded-sm">
                        {flow.status}
                      </Badge>
                    </div>
                    <h3 className="mt-5 text-xl font-semibold">{flow.title}</h3>
                    <div className="mt-4 grid gap-2">
                      {flow.items.map((item) => (
                        <div
                          key={item}
                          className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>

            <section id="produtos" className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
              <Card className="rounded-md bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        Gestao de produtos
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Lista mockada com preco, categoria, estoque e status.
                      </p>
                    </div>
                    <PackagePlus className="size-5 text-gold" />
                  </div>

                  <div className="mt-6 overflow-hidden rounded-md border border-border">
                    <div className="grid grid-cols-[1.2fr_0.8fr_0.55fr_0.7fr_0.7fr] bg-ivory px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      <span>Produto</span>
                      <span>Categoria</span>
                      <span>Estoque</span>
                      <span>Preco</span>
                      <span>Status</span>
                    </div>
                    {products.map((product) => (
                      <div
                        key={product.name}
                        className="grid grid-cols-[1.2fr_0.8fr_0.55fr_0.7fr_0.7fr] border-t border-border px-4 py-4 text-sm"
                      >
                        <span className="font-medium">{product.name}</span>
                        <span className="text-muted-foreground">{product.category}</span>
                        <span className="text-muted-foreground">{product.stock}</span>
                        <span className="font-medium">{product.price}</span>
                        <span>
                          <Badge className="rounded-sm bg-ivory text-gold-foreground">
                            {product.status}
                          </Badge>
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {adminModules.slice(0, 4).map((module) => (
                  <ModuleCard key={module.title} module={module} />
                ))}
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <Card className="rounded-md bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Truck className="size-5 text-gold" />
                    <h3 className="text-xl font-semibold">Gestao de pedidos</h3>
                  </div>
                  <div className="mt-6 grid gap-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-md border border-border p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-gold">
                              {order.id}
                            </p>
                            <p className="mt-1 font-semibold">{order.customer}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {order.items}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <Badge className="rounded-sm bg-ivory text-gold-foreground">
                              {order.status}
                            </Badge>
                            <p className="mt-2 font-semibold">{order.total}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {adminModules.slice(4).map((module) => (
                  <ModuleCard key={module.title} module={module} />
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </section>
  );
}

function ModuleCard({
  module,
}: {
  module: {
    title: string;
    description: string;
    count: string;
    icon: ComponentType<{ className?: string }>;
  };
}) {
  return (
    <Card className="rounded-md bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-ivory text-gold">
            <module.icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <h3 className="font-semibold">{module.title}</h3>
              <Badge variant="outline" className="w-fit rounded-sm">
                {module.count}
              </Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {module.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
