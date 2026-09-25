"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { getProductImage, getProductPrice, type StorefrontProduct } from "@/lib/medusa";

export function ProductHero({ products }: { products: StorefrontProduct[] }) {
  const [ids, setIds] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    setIds((previous) => {
      if (previous.length && previous.every((id) => products.some((product) => product.id === id))) return previous;
      const candidates = products.filter((product) => getProductImage(product));
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }
      return candidates.slice(0, 3).map((product) => product.id);
    });
  }, [products]);
  const slides = ids.length ? ids.map((id) => products.find((product) => product.id === id)).filter((product): product is StorefrontProduct => Boolean(product)) : products.filter((product) => getProductImage(product)).slice(0, 3);
  useEffect(() => {
    if (paused || reducedMotion || slides.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((index) => (index + 1) % slides.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, slides.length]);
  const current = slides[active % (slides.length || 1)];
  const image = current && getProductImage(current);
  return <section aria-label="Produtos em destaque" aria-roledescription="carrossel" className="border-b border-border bg-graphite text-white" onFocusCapture={() => setPaused(true)}>
    <div className="container-premium grid items-center gap-8 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:py-12">
      <div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Silva Móveis</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">{current?.title ?? "Móveis para compor o seu espaço."}</h1>
        <p className="mt-5 text-xl text-white/80">{current ? getProductPrice(current) : "Encontre peças para seus melhores momentos."}</p>
        <Link href={current ? `/produto/${current.handle}` : "/catalogo"} className="mt-7 inline-flex rounded-lg bg-gold px-5 py-3 font-medium text-graphite">{current ? "Conhecer produto" : "Ver catálogo"}</Link>
        {slides.length > 1 && <div className="mt-7 flex items-center gap-2">
          {slides.map((product, index) => <button key={product.id} onClick={() => { setActive(index); setPaused(true); }} aria-label={`Mostrar ${product.title}`} aria-pressed={index === active % slides.length} className="grid size-11 place-items-center"><span className={`size-3 rounded-full ${index === active % slides.length ? "bg-gold" : "bg-white/40"}`} /></button>)}
          {!reducedMotion && <button onClick={() => setPaused((value) => !value)} aria-label={paused ? "Iniciar rotação" : "Pausar rotação"} className="grid size-11 place-items-center">{paused ? <Play className="size-4" /> : <Pause className="size-4" />}</button>}
        </div>}
      </div>
      {current && image ? <Link href={`/produto/${current.handle}`} aria-label={`Ver ${current.title}`} className="relative block aspect-square overflow-hidden rounded-xl bg-white/5 focus-visible:outline-2 focus-visible:outline-gold lg:aspect-[6/5]"><Image src={image} alt={current.title} fill priority unoptimized sizes="(max-width: 1024px) 100vw, 60vw" className="object-contain" /></Link> : <div className="aspect-square rounded-xl bg-white/5" />}
    </div>
  </section>;
}
