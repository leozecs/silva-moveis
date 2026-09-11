import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Separator } from "@/components/ui/separator";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Minha conta", href: "/acesso" },
  { label: "Carrinho", href: "/carrinho" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-graphite text-white"><div className="container-premium py-14"><div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:justify-between"><div><BrandLogo /><p className="mt-6 max-w-sm text-sm leading-7 text-white/65">A loja online da Silva Móveis. Produtos e informações serão carregados diretamente da operação.</p></div><div><h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Navegação</h3><div className="mt-5 grid gap-3 sm:grid-cols-2">{footerLinks.map((link) => <Link key={link.href} href={link.href} className="text-sm text-white/65 transition hover:text-white">{link.label}</Link>)}</div></div></div><Separator className="my-8 bg-white/10" /><p className="text-xs text-white/45">© Silva Móveis</p></div></footer>
  );
}
