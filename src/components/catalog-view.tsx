"use client";

import { useMemo, useState } from "react";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type StorefrontCategory, type StorefrontProduct } from "@/lib/medusa";

type CatalogViewProps = {
  products: StorefrontProduct[];
  categories: StorefrontCategory[];
  initialQuery?: string;
  initialCategoryId?: string;
};

export function CatalogView({ products, categories, initialQuery = "", initialCategoryId = "all" }: CatalogViewProps) {
  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCategoryId);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return products.filter((product) => {
      const matchesQuery = !normalizedQuery || [product.title, product.subtitle, product.description]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(normalizedQuery);
      const matchesCategory = categoryId === "all" || product.categories?.some((category) => category.id === categoryId);
      return matchesQuery && matchesCategory;
    });
  }, [categoryId, products, query]);

  return (
    <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-28 rounded-md border border-border bg-white p-5">
          <div className="flex items-center justify-between"><p className="font-semibold">Categorias</p><Filter className="size-4 text-gold" /></div>
          <div className="mt-5 grid gap-2">
            <Button variant={categoryId === "all" ? "secondary" : "ghost"} className="justify-start" onClick={() => setCategoryId("all")}>Todos os produtos</Button>
            {categories.map((category) => <Button key={category.id} variant={categoryId === category.id ? "secondary" : "ghost"} className="justify-start" onClick={() => setCategoryId(category.id)}>{category.name}</Button>)}
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sofá, poltrona, mesa..." aria-label="Buscar produtos" className="pl-9" /></div>
          <Button variant="outline" className="lg:hidden"><SlidersHorizontal className="size-4" />Filtros</Button>
          <Badge variant="outline" className="w-fit shrink-0">{visibleProducts.length} {visibleProducts.length === 1 ? "produto" : "produtos"}</Badge>
        </div>

        {visibleProducts.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        ) : (
          <div className="mt-8 rounded-md border border-dashed border-border bg-white px-6 py-16 text-center"><h2 className="text-2xl font-semibold">Catálogo em preparação</h2><p className="mx-auto mt-3 max-w-md text-muted-foreground">Os produtos aparecerão aqui assim que o catálogo da loja estiver conectado.</p></div>
        )}
      </div>
    </div>
  );
}
