import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function WhatsAppFloating() {
  const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL;
  if (!whatsappUrl) return null;

  return <Link href={whatsappUrl} target="_blank" className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-green-600 text-white shadow-2xl shadow-green-900/20 transition hover:-translate-y-1 hover:bg-green-700" aria-label="Falar com a Silva Móveis pelo WhatsApp" title="Solicitar atendimento"><MessageCircle className="size-6" /></Link>;
}
