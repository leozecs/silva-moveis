import { Mail, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContatoPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8 lg:py-24"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Contato</p><h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Vamos conversar.</h1><p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">Os canais oficiais da Silva Móveis serão disponibilizados nesta área.</p><div className="mt-8 grid gap-4"><Card><CardContent className="flex items-center gap-4 p-5"><MessageCircle className="size-5 text-gold" /><div><p className="font-medium">Atendimento</p><p className="text-sm text-muted-foreground">Canal em configuração</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-4 p-5"><Mail className="size-5 text-gold" /><div><p className="font-medium">E-mail</p><p className="text-sm text-muted-foreground">Endereço em configuração</p></div></CardContent></Card></div></div><Card><CardContent className="p-6 sm:p-8"><h2 className="text-2xl font-semibold">Envie uma mensagem</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">O envio será ativado junto com o serviço de atendimento.</p><div className="mt-7 grid gap-5"><div className="grid gap-2"><label htmlFor="name" className="text-sm font-medium">Nome</label><Input id="name" placeholder="Seu nome" /></div><div className="grid gap-2"><label htmlFor="contact-email" className="text-sm font-medium">E-mail</label><Input id="contact-email" type="email" placeholder="seu@email.com" /></div><div className="grid gap-2"><label htmlFor="message" className="text-sm font-medium">Mensagem</label><Textarea id="message" placeholder="Como podemos ajudar?" rows={5} /></div><Button type="button" disabled><Send className="size-4" />Enviar mensagem</Button></div></CardContent></Card></main>
  );
}
