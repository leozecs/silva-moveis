import Link from "next/link";
import { ArrowRight, Boxes, ChevronRight, ShoppingBag } from "lucide-react";
import { CatalogView } from "@/components/catalog-view";
import { getStorefrontCategories, getStorefrontProducts } from "@/lib/medusa";

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getStorefrontProducts(),
    getStorefrontCategories(),
  ]);

  return (
    <main>
      <section className="border-b border-border bg-graphite text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Silva Móveis</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">Móveis para compor o seu espaço.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg">Explore o catálogo e encontre as peças disponíveis para o seu ambiente.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/catalogo" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gold px-2.5 text-sm font-medium text-graphite transition hover:bg-gold/90">Ver catálogo<ArrowRight className="size-4" /></Link><Link href="/sobre" className="inline-flex h-9 items-center rounded-lg border border-white/25 bg-white/5 px-2.5 text-sm font-medium text-white transition hover:bg-white/10">Conheça a loja</Link></div>
          </div>
          <div className="grid min-h-72 place-items-center rounded-md border border-white/10 bg-white/[0.04] p-8 text-center sm:min-h-96"><div><ShoppingBag className="mx-auto size-12 text-gold" /><p className="mt-5 text-lg font-medium">Seu próximo ambiente começa aqui.</p><p className="mt-2 text-sm leading-6 text-white/60">O catálogo será preenchido pela operação da loja.</p></div></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Categorias</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Encontre o que procura.</h2></div><Link href="/catalogo" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-gold">Ver catálogo<ChevronRight className="size-4" /></Link></div>
        {categories.length ? <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{categories.map((category) => <Link key={category.id} href={`/catalogo?categoria=${category.id}`} className="group rounded-md border border-border bg-white p-6 transition hover:-translate-y-1 hover:border-gold/60 hover:shadow-lg"><Boxes className="size-7 text-gold" /><h3 className="mt-12 text-xl font-semibold">{category.name}</h3><span className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground">Explorar<ArrowRight className="size-3.5" /></span></Link>)}</div> : <div className="mt-10 rounded-md border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-muted-foreground">As categorias serão exibidas quando o catálogo estiver conectado.</div>}
      </section>

      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Produtos</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Disponibilidade em tempo real.</h2></div><p className="max-w-md text-sm leading-6 text-muted-foreground">Os produtos, imagens e preços desta vitrine vêm do catálogo da operação.</p></div><div className="mt-10"><CatalogView products={products} categories={categories} /></div></div>
      </section>
    </main>
  );
}
