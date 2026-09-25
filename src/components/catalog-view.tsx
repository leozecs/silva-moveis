"use client";

import { useMemo, useState } from "react";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type StorefrontCategory, type StorefrontProduct } from "@/lib/medusa";
import { money } from "@/lib/cart";
import { matchesProductSearch } from "@/lib/product-search";

type CatalogViewProps = {
  products: StorefrontProduct[];
  categories: StorefrontCategory[];
  initialQuery?: string;
  initialCategoryId?: string;
};

export function CatalogView({ products, categories, initialQuery = "", initialCategoryId = "all" }: CatalogViewProps) {
  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState("price-asc");
  const ceiling = Math.ceil(Math.max(0, ...products.map((product) => product.variants?.[0]?.calculated_price?.calculated_amount ?? 0)));
  const [priceLimit, setPriceLimit] = useState<number | null>(null);
  const maximum = Math.min(priceLimit ?? ceiling, ceiling);

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery = matchesProductSearch(product, query);
      const matchesCategory = categoryId === "all" || product.categories?.some((category) => category.id === categoryId);
      const price = product.variants?.[0]?.calculated_price?.calculated_amount;
      return matchesQuery && matchesCategory && (price == null ? priceLimit === null : price <= maximum);
    }).sort((a, b) => {
      const left = a.variants?.[0]?.calculated_price?.calculated_amount;
      const right = b.variants?.[0]?.calculated_price?.calculated_amount;
      if (left == null) return right == null ? 0 : 1;
      if (right == null) return -1;
      return sort === "price-desc" ? right - left : left - right;
    });
  }, [categoryId, products, query, maximum, priceLimit, sort]);

  return (
    <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
      <aside id="catalog-filters" className={filtersOpen ? "block" : "hidden lg:block"}>
        <div className="sticky top-28 rounded-md border border-border bg-white p-5">
          <div className="flex items-center justify-between"><p className="font-semibold">Categorias</p><Filter className="size-4 text-gold" /></div>
          <div className="mt-5 grid max-h-72 gap-2 overflow-y-auto">
            <Button variant={categoryId === "all" ? "secondary" : "ghost"} className="justify-start" onClick={() => setCategoryId("all")}>Todos os produtos</Button>
            {categories.map((category) => <Button key={category.id} variant={categoryId === category.id ? "secondary" : "ghost"} className="justify-start" onClick={() => setCategoryId(category.id)}>{category.name}</Button>)}
          </div>
          <div className="mt-6 border-t pt-5">
            <label htmlFor="catalog-max-price" className="block text-sm font-medium">Preço máximo: {money(maximum, "brl")}</label>
            <input id="catalog-max-price" type="range" min="0" max={ceiling || 1} step="1" value={maximum} onChange={(event) => setPriceLimit(Number(event.target.value))} className="mt-4 w-full accent-amber-700" aria-valuetext={money(maximum, "brl")} disabled={!ceiling} />
            <Button variant="ghost" className="mt-3" onClick={() => { setCategoryId("all"); setPriceLimit(null); setQuery(""); }}>Limpar filtros</Button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sofá, poltrona, mesa..." aria-label="Buscar produtos" className="pl-9" /></div>
          <Button variant="outline" className="lg:hidden" aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={() => setFiltersOpen((value) => !value)}><SlidersHorizontal className="size-4" />Filtros</Button>
          <Badge variant="outline" className="w-fit shrink-0">{visibleProducts.length} {visibleProducts.length === 1 ? "produto" : "produtos"}</Badge>
          <details className="relative shrink-0"><summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border px-3 py-2 text-sm"><SlidersHorizontal className="size-4" />Ordenar por: {sort === "price-asc" ? "Menor preço" : "Maior preço"}</summary><div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border bg-background p-2 shadow-lg">{[{ value: "price-asc", label: "Menor preço" }, { value: "price-desc", label: "Maior preço" }].map((option) => <button key={option.value} aria-pressed={sort === option.value} className="w-full rounded p-3 text-left text-sm hover:bg-muted aria-pressed:bg-muted" onClick={(event) => { setSort(option.value); event.currentTarget.closest("details")?.removeAttribute("open"); }}>{option.label}</button>)}</div></details>
        </div>

        {visibleProducts.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        ) : (
          <div className="mt-8 rounded-md border border-dashed border-border bg-white px-6 py-16 text-center"><h2 className="text-2xl font-semibold">Nenhum produto encontrado</h2><p className="mx-auto mt-3 max-w-md text-muted-foreground">Tente outra busca ou ajuste os filtros.</p></div>
        )}
      </div>
    </div>
  );
}
