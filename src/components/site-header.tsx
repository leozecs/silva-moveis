"use client";

import Link from "next/link";
import { LayoutDashboard, Menu, Search, ShoppingCart, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { categories } from "@/lib/data";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Catalogo", href: "/catalogo" },
  { label: "Carrinho", href: "/carrinho" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-black/10 bg-white/88 backdrop-blur-xl">
      <div className="container-premium flex h-20 items-center justify-between gap-5">
        <BrandLogo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-4 py-2 text-sm font-medium text-foreground/78 transition hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}

          <div className="group relative">
            <button className="rounded-md px-4 py-2 text-sm font-medium text-foreground/78 transition hover:bg-muted hover:text-foreground">
              Colecoes
            </button>
            <div className="pointer-events-none absolute left-1/2 top-full w-[720px] -translate-x-1/2 pt-5 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="grid grid-cols-[0.85fr_1.15fr] gap-6 rounded-md border border-border bg-white p-6 shadow-2xl">
                <div className="bg-graphite p-6 text-white">
                  <p className="text-xs uppercase tracking-[0.28em] text-gold">
                    Silva Moveis
                  </p>
                  <p className="mt-4 text-2xl font-semibold tracking-tight">
                    Ambientes externos com assinatura premium.
                  </p>
                  <p className="mt-4 text-sm leading-6 text-white/70">
                    Linha demonstrativa para sofas, poltronas, areas gourmet e
                    piscina.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href="/catalogo"
                      className="rounded-md border border-border p-4 transition hover:border-gold hover:bg-ivory"
                    >
                      <span className="text-sm font-semibold">
                        {category.name}
                      </span>
                      <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                        {category.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" size="icon-lg" aria-label="Busca visual">
            <Search className="size-4" />
          </Button>
          <Link
            href="/admin"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-gold/50 bg-ivory px-4 text-sm font-medium transition hover:border-gold hover:bg-white"
          >
            <LayoutDashboard className="size-4" />
            Admin
          </Link>
          <Link
            href="/acesso"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition hover:border-gold hover:bg-ivory"
          >
            <UserRound className="size-4" />
            Entrar
          </Link>
          <Link
            href="/carrinho"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/88"
          >
            <ShoppingCart className="size-4" />
            Carrinho
          </Link>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon-lg"
                className="lg:hidden"
                aria-label="Abrir menu"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent className="w-[88vw] max-w-sm bg-white">
            <SheetHeader className="border-b border-border">
              <SheetTitle>Silva Moveis</SheetTitle>
              <SheetDescription>
                Navegue pelo prototipo visual da loja.
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-2 px-4">
              <Link
                href="/admin"
                className="rounded-md border border-gold/50 bg-white px-4 py-3 text-sm font-medium"
              >
                Painel admin teste
              </Link>
              <Link
                href="/acesso"
                className="rounded-md border border-gold bg-ivory px-4 py-3 text-sm font-medium"
              >
                Entrar ou cadastrar
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md border border-border px-4 py-3 text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="px-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-gold">
                Categorias
              </p>
              <div className="grid gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href="/catalogo"
                    className="rounded-md bg-muted px-4 py-3 text-sm"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
