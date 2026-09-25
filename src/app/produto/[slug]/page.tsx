import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Ruler } from "lucide-react";
import { ProductPurchase } from "@/components/product-purchase";
import { availability } from "@/lib/availability";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { Card, CardContent } from "@/components/ui/card";
import { getProductImage, getStorefrontProduct, getStorefrontProducts, storefrontImageUrl } from "@/lib/medusa";

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
  const images = [getProductImage(product), ...(product.images?.map((image) => storefrontImageUrl(image.url)) ?? [])].filter((image, index, all): image is string => Boolean(image) && all.indexOf(image) === index);
  const calculatedPrice = product.variants?.[0]?.calculated_price;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? product.subtitle ?? product.title,
    image: images,
    sku: product.variants?.[0]?.id,
    brand: { "@type": "Brand", name: "Silva Móveis" },
    offers: calculatedPrice ? { "@type": "Offer", priceCurrency: calculatedPrice.currency_code.toUpperCase(), price: (calculatedPrice.calculated_amount / 100).toFixed(2), availability: `https://schema.org/${availability(product.variants?.[0]).schema}`, url: `https://silvamoveis.com.br/produto/${product.handle}` } : undefined,
  };

  return (
    <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} /><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <Link href="/catalogo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Voltar ao catálogo</Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
        <ProductGallery images={images} name={product.title} />
        <div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">{product.collection?.title ?? "Produto"}</p><h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{product.title}</h1>{product.subtitle || product.description ? <p className="mt-5 text-base leading-7 text-muted-foreground">{product.subtitle ?? product.description}</p> : null}<Card className="mt-8"><CardContent className="p-6"><div className="flex items-center gap-3 text-sm"><Ruler className="size-5 text-gold" /><span>Escolha seu produto</span></div><ProductPurchase key={product.id} variants={product.variants ?? []} options={product.options ?? []} /></CardContent></Card><div className="mt-8 grid gap-3 text-sm text-muted-foreground"><p className="flex items-center gap-2"><Check className="size-4 text-gold" />Produção cuidadosa e acabamento de qualidade.</p><p className="flex items-center gap-2"><Check className="size-4 text-gold" />Confira as condições de entrega antes de concluir sua compra.</p></div></div>
      </div>
      {relatedProducts.length ? <section className="mt-20 border-t border-border pt-12"><h2 className="text-2xl font-semibold">Você também pode gostar</h2><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}</div></section> : null}
    </main></>
  );
}
