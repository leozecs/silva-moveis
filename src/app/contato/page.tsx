import Link from "next/link";
import { AtSign, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata = {
  title: "Contato | Silva Moveis",
  description: "Contato visual demonstrativo da Silva Moveis.",
};

export default function ContatoPage() {
  return (
    <>
      <section className="bg-graphite pt-32 text-white">
        <div className="container-premium grid gap-10 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
              Contato
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
              Atendimento consultivo para ambientes externos premium.
            </h1>
          </div>
          <p className="text-lg leading-8 text-white/68">
            Pagina demonstrativa com formulario visual, WhatsApp em destaque,
            localizacao e redes sociais. Nenhum envio real e realizado nesta
            etapa.
          </p>
        </div>
      </section>

      <section className="bg-ivory py-20">
        <div className="container-premium grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-md bg-white shadow-sm">
            <CardContent className="p-6 md:p-8">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-gold">
                  Formulario visual
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Solicite uma proposta
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Campos mockados para apresentar a experiencia futura.
                </p>
              </div>

              <form className="grid gap-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Input className="h-12 rounded-md" placeholder="Nome" />
                  <Input className="h-12 rounded-md" placeholder="Telefone" />
                </div>
                <Input className="h-12 rounded-md" placeholder="E-mail" />
                <Input
                  className="h-12 rounded-md"
                  placeholder="Ambiente de interesse"
                />
                <Textarea
                  className="min-h-36 rounded-md"
                  placeholder="Conte sobre o espaco, medidas aproximadas e estilo desejado"
                />
                <Button
                  type="button"
                  className="h-12 rounded-md bg-primary text-primary-foreground hover:bg-primary/88"
                >
                  Enviar demonstracao
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-5">
            <Card className="rounded-md border-gold/35 bg-graphite text-white shadow-sm">
              <CardContent className="p-7">
                <MessageCircle className="size-9 text-gold" />
                <h2 className="mt-5 text-2xl font-semibold">
                  WhatsApp em destaque
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  Canal principal para orcamentos consultivos e agendamento de
                  showroom.
                </p>
                <Link
                  href="https://wa.me/5500000000000?text=Ola%2C%20gostaria%20de%20solicitar%20um%20orcamento%20da%20Silva%20Moveis."
                  target="_blank"
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-gold px-5 text-sm font-semibold text-gold-foreground transition hover:bg-white"
                >
                  Chamar no WhatsApp
                </Link>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Phone, title: "Telefone", value: "(00) 00000-0000" },
                { icon: Mail, title: "E-mail", value: "contato@silvamoveis.com.br" },
                { icon: MapPin, title: "Localizacao", value: "Showroom mediante agendamento" },
                { icon: AtSign, title: "Instagram", value: "@silvamoveis" },
              ].map((item) => (
                <Card key={item.title} className="rounded-md bg-white shadow-sm">
                  <CardContent className="p-5">
                    <item.icon className="size-5 text-gold" />
                    <p className="mt-4 font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="overflow-hidden rounded-md bg-white shadow-sm">
              <div className="grid h-56 place-items-center bg-[linear-gradient(135deg,#f8f8f6,#e8e0cf)]">
                <div className="text-center">
                  <MapPin className="mx-auto size-8 text-gold" />
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.22em]">
                    Mapa demonstrativo
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
