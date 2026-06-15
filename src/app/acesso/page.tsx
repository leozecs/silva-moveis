import Link from "next/link";
import { LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Login e Cadastro | Silva Moveis",
  description: "Tela visual de login e cadastro de clientes da Silva Moveis.",
};

export default function AcessoPage() {
  return (
    <section className="min-h-screen bg-ivory pt-32">
      <div className="container-premium grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <Badge className="rounded-sm bg-white text-gold-foreground shadow-sm">
            Area do cliente
          </Badge>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-6xl">
            Login e cadastro para uma compra personalizada.
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Nesta etapa o acesso e apenas visual. Na loja completa, o cliente
            podera entrar, cadastrar dados, acompanhar pedidos e manter seu
            historico de compras.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: UserRound, title: "Perfil", text: "Dados do cliente" },
              { icon: ShieldCheck, title: "Seguro", text: "Compra protegida" },
              { icon: LockKeyhole, title: "Historico", text: "Pedidos salvos" },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-md border border-border bg-white p-4 shadow-sm"
              >
                <item.icon className="size-5 text-gold" />
                <p className="mt-3 font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="rounded-md bg-white shadow-xl">
          <CardContent className="p-6 md:p-8">
            <Tabs defaultValue="login" className="gap-6">
              <TabsList className="h-11 w-full rounded-md">
                <TabsTrigger value="login" className="h-9">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="cadastro" className="h-9">
                  Criar cadastro
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Acesse sua conta
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Formulario demonstrativo, sem autenticacao real.
                  </p>
                </div>
                <div className="mt-6 grid gap-4">
                  <Input className="h-12 rounded-md" placeholder="E-mail" />
                  <Input
                    className="h-12 rounded-md"
                    placeholder="Senha"
                    type="password"
                  />
                  <Button className="h-12 rounded-md" type="button">
                    Entrar na area do cliente
                  </Button>
                </div>
                <Separator className="my-6" />
                <Link
                  href="/minha-conta"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-foreground underline underline-offset-4"
                >
                  Ver painel do cliente mockado
                </Link>
              </TabsContent>

              <TabsContent value="cadastro">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Crie seu cadastro
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Dados usados apenas para demonstrar a futura jornada.
                  </p>
                </div>
                <div className="mt-6 grid gap-4">
                  <Input className="h-12 rounded-md" placeholder="Nome completo" />
                  <Input className="h-12 rounded-md" placeholder="Telefone" />
                  <Input className="h-12 rounded-md" placeholder="E-mail" />
                  <Input
                    className="h-12 rounded-md"
                    placeholder="Senha"
                    type="password"
                  />
                  <Button className="h-12 rounded-md" type="button">
                    Cadastrar cliente
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-7 flex items-start gap-3 rounded-md bg-ivory p-4 text-sm text-muted-foreground">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold" />
              <span>
                O backend futuro podera validar e-mail, senha, enderecos e
                documentos antes de liberar compras recorrentes.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
