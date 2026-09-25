"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Suggestion = { id: string; title: string; href: string; image: string | null; price: string | null };

export function ProductSearch({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [state, setState] = useState<{ query: string; products: Suggestion[]; hasMore: boolean; error?: boolean } | null>(null);
  const term = query.trim();
  const results = state?.query === term ? state : null;
  const href = `/catalogo?busca=${encodeURIComponent(term)}`;
  const expanded = open && Boolean(term);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!term) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!controller.signal.aborted) setState({ query: term, products: data.products, hasMore: data.hasMore });
      } catch { if (!controller.signal.aborted) setState({ query: term, products: [], hasMore: false, error: true }); }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [term]);
  return <form role="search" className={mobile ? "relative flex w-full sm:hidden" : "relative hidden min-w-0 flex-1 sm:flex"}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    onSubmit={(event) => { event.preventDefault(); setOpen(false); router.push(active >= 0 && results?.products[active] ? results.products[active].href : term ? href : "/catalogo"); }}>
    <div className="relative w-full"><Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input role="combobox" aria-autocomplete="list" aria-expanded={expanded} aria-controls={`${id}-list`} aria-activedescendant={expanded && active >= 0 ? `${id}-${active}` : undefined} type="search" autoComplete="off" enterKeyHint="search" maxLength={100} value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setActive(-1); setOpen(true); }} onKeyDown={(event) => {
        if (event.key === "Escape") { setOpen(false); setActive(-1); }
        if (["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); setOpen(true); const count = results?.products.length ?? 0; if (count) setActive((index) => index < 0 ? (event.key === "ArrowDown" ? 0 : count - 1) : (index + (event.key === "ArrowDown" ? 1 : -1) + count) % count); }
      }} placeholder="Sofá, poltrona, mesa..." aria-label="Buscar produtos" className="h-12 rounded-full border-black/15 bg-white/85 pl-11 pr-4 text-base shadow-none focus-visible:bg-white" />
    </div>
    {expanded && <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-[65dvh] overflow-y-auto rounded-xl border bg-white p-2 shadow-xl">
      <ul id={`${id}-list`} role="listbox" aria-label="Sugestões de produtos">{results?.products.map((product, index) => <li key={product.id} role="presentation"><Link id={`${id}-${index}`} role="option" aria-selected={active === index} href={product.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-lg p-3 hover:bg-muted ${active === index ? "bg-muted" : ""}`}>
        {product.image && <Image src={product.image} alt="" width={48} height={48} className="size-12 rounded object-cover" unoptimized />}
        <span className="min-w-0"><span className="block text-sm font-medium">{product.title}</span><span className="text-xs text-muted-foreground">{product.price}</span></span>
      </Link></li>)}</ul>
      {!results ? <p role="status" className="p-3 text-sm">Buscando produtos...</p> : results.error ? <p role="status" className="p-3 text-sm">Não foi possível carregar as sugestões.</p> : !results.products.length ? <p role="status" className="p-3 text-sm">Nenhum produto encontrado.</p> : null}
      {results?.hasMore && <Link href={href} onClick={() => setOpen(false)} className="block border-t p-3 text-center text-sm font-semibold hover:bg-muted">Ver mais +</Link>}
    </div>}
  </form>;
}
