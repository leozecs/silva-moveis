"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

const screenGroups = [
  {
    label: "Loja",
    items: [
      { label: "Home", href: "/" },
      { label: "Catalogo", href: "/catalogo" },
      { label: "Carrinho", href: "/carrinho" },
      { label: "Sobre", href: "/sobre" },
      { label: "Contato", href: "/contato" },
    ],
  },
  {
    label: "Cliente",
    items: [
      { label: "Entrar ou cadastrar", href: "/acesso" },
      { label: "Minha conta", href: "/minha-conta" },
    ],
  },
  {
    label: "Lojista (preview)",
    items: [{ label: "Painel admin", href: "/admin" }],
  },
];

export function SiteHeader() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const cartCount = 0;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();

    router.push(term ? `/catalogo?busca=${encodeURIComponent(term)}` : "/catalogo");
  }

  function SearchForm({ mobile = false }: { mobile?: boolean }) {
    return (
      <form
        onSubmit={handleSearch}
        className={mobile ? "flex w-full sm:hidden" : "hidden min-w-0 flex-1 sm:flex"}
        role="search"
      >
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Sofá, poltrona, mesa..."
            aria-label="Buscar produtos"
            className="h-12 rounded-full border-black/15 bg-white/85 pl-11 pr-4 text-sm shadow-none focus-visible:bg-white"
          />
        </div>
      </form>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-ivory shadow-sm">
      <div className="container-premium">
        <div className="flex min-h-24 items-center gap-3 py-3 sm:gap-5">
          <BrandLogo />
          <SearchForm />

          <Link
            href="/acesso"
            className="header-enter-link hidden shrink-0 items-center gap-2 rounded-md px-2 py-2 text-left transition hover:bg-white/70 sm:flex"
          >
            <UserRound className="size-5 text-gold" />
            <span>
              <span className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Minha conta
              </span>
              <span className="block text-sm font-semibold">Entrar</span>
            </span>
          </Link>

          <Link
            href="/carrinho"
            className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-black/15 bg-white/70 text-foreground transition hover:border-gold hover:bg-white"
            aria-label={`Carrinho com ${cartCount > 9 ? "9 ou mais" : cartCount} itens`}
          >
            <ShoppingCart className="size-5" />
            <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-gold px-1.5 py-0.5 text-[11px] font-bold leading-none text-gold-foreground">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-lg"
                  className="rounded-full border-black/15 bg-white/70"
                  aria-label="Abrir menu"
                />
              }
            >
              <Menu className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-2">
              {screenGroups.map((group, groupIndex) => (
                <DropdownMenuGroup key={group.label}>
                  {groupIndex > 0 ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                  {group.items.map((item) => (
                    <DropdownMenuItem
                      key={item.href}
                      render={<Link href={item.href} />}
                      className="px-3 py-2"
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="pb-3 sm:hidden">
          <SearchForm mobile />
        </div>
      </div>
    </header>
  );
}
