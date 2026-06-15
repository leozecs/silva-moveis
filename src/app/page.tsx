import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Quote, Ruler, Shield, Sofa } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  categories,
  differentials,
  featuredProducts,
  heroImage,
  inspirations,
  testimonials,
} from "@/lib/data";

export default function Home() {
  return (
    <>
      <section className="relative min-h-[94vh] overflow-hidden pt-20 text-white">
        <Image
          src={heroImage}
          alt="Ambiente externo sofisticado com moveis premium"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/.72),rgb(0_0_0/.28),rgb(0_0_0/.08))]" />

        <div className="container-premium relative flex min-h-[calc(94vh-5rem)] items-center pb-16 pt-16">
          <div className="max-w-3xl">
            <Badge className="rounded-sm border border-gold/40 bg-white/10 px-3 py-1 text-gold backdrop-blur">
              Moveis externos de alto padrao
            </Badge>
            <h1 className="mt-7 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Ambientes externos com conforto, presença e acabamento premium.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
              A Silva Moveis cria composicoes sofisticadas para varandas, areas
              gourmet, piscinas e espacos de lazer com fibra sintetica e corda
              nautica.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/catalogo"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-semibold text-foreground transition hover:bg-gold hover:text-gold-foreground"
              >
                Ver Catalogo
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/acesso"
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/35 px-6 text-sm font-semibold text-white backdrop-blur transition hover:border-gold hover:bg-white/10"
              >
                Entrar ou Cadastrar
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/15 bg-black/22 backdrop-blur">
          <div className="container-premium grid gap-4 py-5 text-sm text-white/75 sm:grid-cols-3">
            <span className="flex items-center gap-2">
              <Sofa className="size-4 text-gold" /> Linhas para area externa
            </span>
            <span className="flex items-center gap-2">
              <Ruler className="size-4 text-gold" /> Composicoes sob medida
            </span>
            <span className="flex items-center gap-2">
              <Shield className="size-4 text-gold" /> Materiais de alta durabilidade
            </span>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="container-premium">
          <SectionHeading
            eyebrow="Categorias"
            title="Linhas pensadas para transformar lazer em experiencia."
            description="Uma vitrine visual para apresentar ao cliente o potencial da futura loja virtual, com categorias claras e linguagem premium."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href="/catalogo"
                className="group relative min-h-[360px] overflow-hidden rounded-md bg-muted"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-transparent" />
                <div className="absolute bottom-0 p-6 text-white">
                  <h3 className="text-2xl font-semibold">{category.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/72">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory py-24">
        <div className="container-premium">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Destaques"
              title="Produtos com apelo visual para proposta comercial."
              description="Cards elegantes, imagem grande e hierarquia pronta para evoluir para integracao com catalogo real."
            />
            <Link
              href="/catalogo"
              className="inline-flex h-11 w-fit items-center gap-2 rounded-md border border-foreground px-5 text-sm font-semibold transition hover:bg-foreground hover:text-white"
            >
              Ver todos
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="container-premium">
          <SectionHeading
            eyebrow="Ambientes"
            title="Inspiracao para varandas, decks e areas gourmet."
            align="center"
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-[1.3fr_0.85fr_0.85fr]">
            {inspirations.map((item, index) => (
              <div
                key={item.title}
                className="group relative min-h-[420px] overflow-hidden rounded-md bg-muted lg:first:min-h-[520px]"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes={index === 0 ? "50vw" : "25vw"}
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 p-7 text-white">
                  <p className="text-xs uppercase tracking-[0.24em] text-gold">
                    Ambiente {index + 1}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-graphite py-24 text-white">
        <div className="container-premium">
          <SectionHeading
            eyebrow="Diferenciais"
            title="Confianca percebida em cada detalhe."
            description="A apresentacao reforca valor, processo e qualidade sem depender de funcionalidades de e-commerce nesta etapa."
            className="text-white [&_h2]:text-white [&_p:not(:first-child)]:text-white/65"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {differentials.map((item) => (
              <Card
                key={item.title}
                className="rounded-md border-white/10 bg-white/[0.04] text-white shadow-none"
              >
                <CardContent className="p-6">
                  <div className="grid size-11 place-items-center rounded-full bg-gold text-gold-foreground">
                    <item.icon className="size-5" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/65">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="container-premium">
          <SectionHeading
            eyebrow="Depoimentos"
            title="Percepcao de marca premium para clientes e arquitetos."
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="rounded-md shadow-sm">
                <CardContent className="p-7">
                  <Quote className="size-8 text-gold" />
                  <p className="mt-6 text-base leading-7 text-foreground/80">
                    “{testimonial.quote}”
                  </p>
                  <div className="mt-7 border-t border-border pt-5">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {testimonial.context}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory py-24">
        <div className="container-premium">
          <div className="relative overflow-hidden rounded-md bg-graphite p-8 text-white md:p-12">
            <div className="absolute inset-y-0 right-0 hidden w-1/2 md:block">
              <Image
                src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=84"
                alt="Living externo Silva Moveis"
                fill
                sizes="50vw"
                className="object-cover opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-graphite to-transparent" />
            </div>
            <div className="relative max-w-2xl">
              <BadgeCheck className="size-9 text-gold" />
              <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-5xl">
                Pronto para apresentar a nova loja virtual da Silva Moveis.
              </h2>
              <p className="mt-5 text-base leading-7 text-white/68">
                Um frontend visual, responsivo e componentizado para validar
                catalogo, acesso do cliente, carrinho e checkout com Mercado
                Pago antes da etapa de backend.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/catalogo"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-gold px-5 text-sm font-semibold text-gold-foreground transition hover:bg-white"
                >
                  Explorar catalogo
                </Link>
                <Link
                  href="/carrinho"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-white/25 px-5 text-sm font-semibold text-white transition hover:border-gold"
                >
                  Ver carrinho demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
