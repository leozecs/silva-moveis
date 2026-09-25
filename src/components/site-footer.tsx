"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
  { label: "Privacidade", href: "/politica-de-privacidade" },
  { label: "Termos de uso", href: "/termos-de-uso" },
  { label: "Trocas e devoluções", href: "/trocas-e-devolucoes" },
  { label: "Entrega", href: "/entrega" },
];

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-graphite text-white">
    <div className="container-premium flex min-h-16 items-center justify-between gap-4 pb-[env(safe-area-inset-bottom)]">
      <p className="text-xs text-white/75">© Silva Móveis</p>
      <nav aria-label="Informações da loja">
        <details className="relative">
          <summary className="cursor-pointer rounded px-3 py-3 text-sm focus-visible:outline-2">Sobre a loja e políticas</summary>
          <div className="absolute bottom-full right-0 mb-3 grid max-h-[60dvh] w-64 gap-1 overflow-y-auto rounded-lg border border-white/15 bg-graphite p-3 shadow-xl">
            {links.map((link) => <Link key={link.href} href={link.href} className="rounded px-3 py-3 text-sm hover:bg-white/10">{link.label}</Link>)}
          </div>
        </details>
      </nav>
    </div>
  </footer>;
}
