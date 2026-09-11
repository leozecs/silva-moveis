import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Ruler, ShoppingCart } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProductImage, getProductPrice, getStorefrontProduct, getStorefrontProducts } from "@/lib/medusa";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getStorefrontProduct(slug);
  return product ? { title: `${product.title} | Silva Móveis`, description: product.subtitle ?? product.description ?? product.title } : { title: "Produto | Silva Móveis" };
}

export default async function ProdutoPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getStorefrontProduct(slug);
  if (!product) notFound();

  const relatedProducts = (await getStorefrontProducts()).filter((item) => item.id !== product.id).slice(0, 3);
  const images = [getProductImage(product), ...(product.images?.map((image) => image.url) ?? [])].filter((image, index, all): image is string => Boolean(image) && all.indexOf(image) === index);
  const price = getProductPrice(product);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <Link href="/catalogo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Voltar ao catálogo</Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
        <ProductGallery images={images} name={product.title} />
        <div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">{product.collection?.title ?? "Produto"}</p><h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{product.title}</h1>{product.subtitle || product.description ? <p className="mt-5 text-base leading-7 text-muted-foreground">{product.subtitle ?? product.description}</p> : null}<p className="mt-8 text-2xl font-semibold">{price ?? "Preço não informado"}</p><Card className="mt-8"><CardContent className="p-6"><div className="flex items-center gap-3 text-sm"><Ruler className="size-5 text-gold" /><span>Detalhes e disponibilidade conforme o catálogo.</span></div><Button className="mt-6 w-full" size="lg" disabled={!price}><ShoppingCart className="size-4" />Adicionar ao carrinho</Button><p className="mt-3 text-center text-xs text-muted-foreground">O carrinho será ativado com a conexão da Medusa.</p></CardContent></Card><div className="mt-8 grid gap-3 text-sm text-muted-foreground"><p className="flex items-center gap-2"><Check className="size-4 text-gold" />Informações sincronizadas com a loja.</p><p className="flex items-center gap-2"><Check className="size-4 text-gold" />Variações e estoque serão definidos no catálogo.</p></div></div>
      </div>
      {relatedProducts.length ? <section className="mt-20 border-t border-border pt-12"><h2 className="text-2xl font-semibold">Você também pode gostar</h2><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}</div></section> : null}
    </main>
  );
}
