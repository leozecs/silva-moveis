"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
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
import { ProductSearch } from "@/components/product-search";
import { useCart } from "@/components/cart-provider";

const screenGroups = [
  {
    label: "Loja",
    items: [
      { label: "Catálogo", href: "/catalogo" },
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
];

export function SiteHeader() {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState(false);
  const [accountHref, setAccountHref] = useState("/acesso");
  const { itemCount: cartCount } = useCart();
  useEffect(() => {
    const controller = new AbortController();
    const refresh = () => {
      fetch("/api/auth/session", { cache: "no-store", signal: controller.signal })
        .then((response) => response.json()).then((session) => {
          if (controller.signal.aborted) return;
          setSignedIn(session.authenticated === true);
          setAccountHref(session.href === "/admin" ? "/admin" : session.authenticated ? "/minha-conta" : "/acesso");
        }).catch(() => {});
    };
    refresh();
    window.addEventListener("silva-session-changed", refresh);
    return () => { controller.abort(); window.removeEventListener("silva-session-changed", refresh); };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-ivory shadow-sm">
      <div className="container-premium">
        <div className="flex min-h-24 items-center gap-3 py-3 sm:gap-5">
          <BrandLogo />
          <ProductSearch />

          <Link
            href={accountHref}
            className="header-enter-link flex shrink-0 items-center gap-2 rounded-md px-2 py-2 text-left transition hover:bg-white/70"
          >
            <UserRound className="size-5 text-gold" />
            {signedIn ? <span className="text-sm font-semibold">Minha Conta</span> : <span>
              <span className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Minha conta
              </span>
              <span className="block text-sm font-semibold">Entrar</span>
            </span>}
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
          <ProductSearch mobile />
        </div>
      </div>
    </header>
  );
}
