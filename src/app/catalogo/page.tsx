import { CatalogView } from "@/components/catalog-view";
import { getStorefrontCategories, getStorefrontProducts } from "@/lib/medusa";

type CatalogPageProps = { searchParams: Promise<{ busca?: string | string[]; categoria?: string | string[] }> };

export default async function CatalogoPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const initialQuery = Array.isArray(params.busca) ? params.busca[0] : params.busca ?? "";
  const initialCategoryId = Array.isArray(params.categoria) ? params.categoria[0] : params.categoria ?? "all";
  const [products, categories] = await Promise.all([
    getStorefrontProducts({ query: initialQuery, categoryId: initialCategoryId === "all" ? undefined : initialCategoryId }),
    getStorefrontCategories(),
  ]);

  return (
    <main>
      <section className="border-b border-border bg-muted/40"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"><p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Catálogo</p><h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Peças disponíveis para o seu ambiente.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">Consulte produtos, categorias e preços diretamente do catálogo da Silva Móveis.</p></div></section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20"><CatalogView products={products} categories={categories} initialQuery={initialQuery} initialCategoryId={initialCategoryId} /></section>
    </main>
  );
}
