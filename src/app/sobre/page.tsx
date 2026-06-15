import Image from "next/image";
import { BadgeCheck, Hammer, Layers, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { processSteps } from "@/lib/data";

export const metadata = {
  title: "Sobre | Silva Moveis",
  description: "Historia, processo e diferenciais da Silva Moveis.",
};

export default function SobrePage() {
  return (
    <>
      <section className="bg-white pt-32">
        <div className="container-premium grid gap-12 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
              Sobre
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
              Moveis externos com alma artesanal e linguagem arquitetonica.
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              A Silva Moveis nasceu para transformar areas externas em ambientes
              de permanencia. A marca combina fibras sinteticas, corda nautica e
              estruturas resistentes com uma curadoria visual que conversa com
              casas de alto padrao, areas gourmet e projetos de lazer.
            </p>
          </div>
          <div className="relative min-h-[560px] overflow-hidden rounded-md bg-muted">
            <Image
              src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1500&q=84"
              alt="Ambiente institucional Silva Moveis"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-ivory py-20">
        <div className="container-premium">
          <SectionHeading
            eyebrow="Processo"
            title="Da leitura do ambiente ao acabamento final."
            description="Uma narrativa institucional preparada para demonstrar confianca e valor percebido no primeiro contato com o cliente."
            align="center"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step) => (
              <Card key={step.title} className="rounded-md bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="grid size-12 place-items-center rounded-full bg-graphite text-gold">
                    <step.icon className="size-5" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container-premium grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative min-h-[360px] overflow-hidden rounded-md bg-muted">
              <Image
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=84"
                alt="Trama e textura de mobiliario premium"
                fill
                sizes="50vw"
                className="object-cover"
              />
            </div>
            <div className="relative mt-10 min-h-[360px] overflow-hidden rounded-md bg-muted">
              <Image
                src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=84"
                alt="Poltrona premium Silva Moveis"
                fill
                sizes="50vw"
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Diferenciais"
              title="O que a marca precisa transmitir no digital."
              description="O frontend foi desenhado para comunicar sofisticaçao, conforto, exclusividade e confianca antes mesmo da integracao com estoque, pedidos ou pagamento."
            />
            <div className="mt-8 grid gap-4">
              {[
                {
                  icon: Sparkles,
                  title: "Percepcao de alto padrao",
                  text: "Tipografia limpa, grandes imagens e detalhes dourados reforcam uma experiencia premium.",
                },
                {
                  icon: Hammer,
                  title: "Fabricacao valorizada",
                  text: "Conteudo institucional apresenta processo, materiais e acabamento como argumentos de venda.",
                },
                {
                  icon: Layers,
                  title: "Pronto para evoluir",
                  text: "Componentes e dados mockados estao organizados para futura integracao com backend Spring Boot.",
                },
                {
                  icon: BadgeCheck,
                  title: "Jornada consultiva",
                  text: "Login, cadastro, carrinho e historico entram como fluxo visual preparado para a futura loja completa.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 rounded-md border border-border p-5">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-ivory text-gold">
                    <item.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
