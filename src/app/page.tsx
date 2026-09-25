import { CatalogView } from "@/components/catalog-view";
import { ProductHero } from "@/components/product-hero";
import { getStorefrontCategories, getStorefrontProducts } from "@/lib/medusa";

export default async function HomePage() {
  const [products, categories] = await Promise.all([getStorefrontProducts(), getStorefrontCategories()]);
  return <main className="pb-[calc(5rem+env(safe-area-inset-bottom))]">
    <ProductHero products={products} />
    <section className="border-y border-border bg-muted/30">
      <div className="container-premium py-16 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Produtos</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Encontre seu próximo móvel.</h2>
        <div className="mt-10"><CatalogView products={products} categories={categories} /></div>
      </div>
    </section>
  </main>;
}
