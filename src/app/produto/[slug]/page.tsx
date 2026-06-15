import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Package,
  Ruler,
  Shield,
  ShoppingCart,
} from "lucide-react";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProductBySlug, products } from "@/lib/data";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  return {
    title: product ? `${product.name} | Silva Moveis` : "Produto | Silva Moveis",
    description: product?.shortDescription,
  };
}

export default async function ProdutoPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter((item) => item.slug !== product.slug)
    .slice(0, 3);

  return (
    <>
      <section className="bg-white pt-28">
        <div className="container-premium py-8">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Voltar ao catalogo
          </Link>
        </div>
      </section>

      <section className="bg-white pb-20">
        <div className="container-premium grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <ProductGallery images={product.gallery} name={product.name} />

          <div>
            <Badge className="rounded-sm bg-ivory text-gold-foreground">
              {product.category}
            </Badge>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.26em] text-gold">
              {product.collection}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              {product.shortDescription}
            </p>

            <div className="mt-8 rounded-md border border-border bg-ivory p-5">
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Condicao comercial
              </p>
              <p className="mt-2 text-2xl font-semibold">{product.priceLabel}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Valor ficticio para apresentacao. Na versao final, o pagamento
                sera integrado ao Mercado Pago.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/carrinho"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/88"
              >
                <ShoppingCart className="size-4" />
                Adicionar ao Carrinho
              </Link>
              <Link
                href="/acesso"
                className="inline-flex h-12 items-center justify-center rounded-md border border-border px-6 text-sm font-semibold transition hover:border-gold hover:bg-ivory"
              >
                Entrar ou cadastrar
              </Link>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-md border border-gold/30 bg-ivory p-4 text-sm text-muted-foreground">
              <CreditCard className="mt-0.5 size-4 shrink-0 text-gold" />
              <span>
                Checkout demonstrativo com cartao, Pix e boleto previstos para
                a integracao futura com Mercado Pago.
              </span>
            </div>

            <Separator className="my-8" />

            <div className="grid gap-4">
              {[
                { icon: Shield, label: "Materiais", value: product.materials },
                { icon: Ruler, label: "Dimensoes", value: product.dimensions },
                {
                  icon: Package,
                  label: "Aplicacao",
                  value: "Areas externas, varandas, gourmet e lazer.",
                },
              ].map((item) => (
                <div key={item.label} className="flex gap-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-ivory text-gold">
                    <item.icon className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-20">
        <div className="container-premium grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              Descricao
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Detalhes pensados para uma venda consultiva.
            </h2>
          </div>
          <Card className="rounded-md bg-white shadow-sm">
            <CardContent className="p-7">
              <p className="text-base leading-8 text-muted-foreground">
                {product.description}
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {product.specs.map((spec) => (
                  <div key={spec} className="flex items-center gap-3">
                    <span className="grid size-6 place-items-center rounded-full bg-gold text-gold-foreground">
                      <Check className="size-3.5" />
                    </span>
                    <span className="text-sm font-medium">{spec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container-premium">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
                Relacionados
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Combine com outras pecas da linha.
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="text-sm font-semibold text-foreground underline underline-offset-4"
            >
              Ver catalogo completo
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {relatedProducts.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
