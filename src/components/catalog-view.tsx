"use client";

import { useMemo, useState } from "react";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories, products } from "@/lib/data";
import { cn } from "@/lib/utils";

const filters = ["Todos", ...categories.map((category) => category.name)];
const finishFilters = ["Fibra sintetica", "Corda nautica", "Aluminio", "Tecido UV"];

export function CatalogView() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesFilter =
        activeFilter === "Todos" || product.category === activeFilter;
      const matchesQuery = [product.name, product.category, product.collection]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-md border border-border bg-white p-5 shadow-sm lg:sticky lg:top-28 lg:h-fit">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-gold" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">
            Filtros
          </h2>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Categoria
          </p>
          <div className="grid gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "rounded-md border px-3 py-2 text-left text-sm transition",
                  activeFilter === filter
                    ? "border-gold bg-ivory text-foreground"
                    : "border-border text-muted-foreground hover:border-gold/60 hover:text-foreground"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 border-t border-border pt-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Acabamentos
          </p>
          <div className="flex flex-wrap gap-2">
            {finishFilters.map((filter) => (
              <Badge
                key={filter}
                variant="outline"
                className="rounded-sm border-border bg-white text-muted-foreground"
              >
                {filter}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-7 rounded-md bg-graphite p-4 text-white">
          <Filter className="size-4 text-gold" />
          <p className="mt-3 text-sm font-medium">Filtro demonstrativo</p>
          <p className="mt-2 text-xs leading-5 text-white/65">
            Busca e filtros funcionam apenas com dados mockados no frontend.
          </p>
        </div>
      </aside>

      <section>
        <div className="mb-6 flex flex-col gap-4 rounded-md border border-border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por sofa, poltrona, piscina..."
              className="h-11 rounded-md pl-10"
            />
          </div>
          <Button variant="outline" className="h-11 justify-start rounded-md">
            <SlidersHorizontal className="size-4" />
            Ordenar por destaque
          </Button>
        </div>

        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {visibleProducts.length} produtos encontrados
          </p>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Catalogo visual para validacao de layout
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
