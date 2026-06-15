import Link from "next/link";
import { AtSign, Mail, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Separator } from "@/components/ui/separator";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Catalogo", href: "/catalogo" },
  { label: "Login e cadastro", href: "/acesso" },
  { label: "Carrinho", href: "/carrinho" },
  { label: "Painel admin", href: "/admin" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-graphite text-white">
      <div className="container-premium py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.8fr_0.8fr_1fr]">
          <div>
            <BrandLogo />
            <p className="mt-6 max-w-sm text-sm leading-7 text-white/65">
              Moveis premium para areas externas, varandas, areas gourmet,
              piscinas e espacos de lazer com acabamento sofisticado. Loja
              preparada visualmente para checkout com Mercado Pago.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">
              Navegacao
            </h3>
            <div className="mt-5 grid gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/65 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">
              Linhas
            </h3>
            <div className="mt-5 grid gap-3 text-sm text-white/65">
              <span>Sofas externos</span>
              <span>Poltronas nauticas</span>
              <span>Conjuntos gourmet</span>
              <span>Piscina e lazer</span>
              <span>Checkout Mercado Pago</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">
              Atendimento
            </h3>
            <div className="mt-5 grid gap-4 text-sm text-white/65">
              <span className="flex items-center gap-3">
                <Phone className="size-4 text-gold" /> (00) 00000-0000
              </span>
              <span className="flex items-center gap-3">
                <Mail className="size-4 text-gold" /> contato@silvamoveis.com.br
              </span>
              <span className="flex items-center gap-3">
                <MapPin className="size-4 text-gold" /> Showroom mediante
                agendamento
              </span>
              <span className="flex items-center gap-3">
                <AtSign className="size-4 text-gold" /> @silvamoveis
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />
        <div className="flex flex-col gap-3 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Silva Moveis. Prototipo visual sem backend.</p>
          <p>Layout demonstrativo para validacao comercial.</p>
        </div>
      </div>
    </footer>
  );
}
