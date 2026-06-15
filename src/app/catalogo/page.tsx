import Image from "next/image";
import { CatalogView } from "@/components/catalog-view";
import { SectionHeading } from "@/components/section-heading";

export const metadata = {
  title: "Catalogo | Silva Moveis",
  description: "Catalogo visual demonstrativo da Silva Moveis.",
};

export default function CatalogoPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-graphite pt-32 text-white">
        <Image
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=84"
          alt="Catalogo Silva Moveis"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-34"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/48 to-black/20" />
        <div className="container-premium relative py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            Catalogo
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">
            Uma vitrine premium para moveis externos de alto impacto.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
            Produtos mockados para validacao visual, com filtros e busca
            simulados diretamente no frontend.
          </p>
        </div>
      </section>

      <section className="bg-ivory py-16">
        <div className="container-premium">
          <SectionHeading
            eyebrow="Produtos"
            title="Grid moderno inspirado em e-commerces premium."
            description="Cards com imagem ampla, categoria visivel e acesso a paginas de produto completas."
          />
          <div className="mt-10">
            <CatalogView />
          </div>
        </div>
      </section>
    </>
  );
}
