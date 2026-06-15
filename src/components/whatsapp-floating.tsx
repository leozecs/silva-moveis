import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function WhatsAppFloating() {
  return (
    <Link
      href="https://wa.me/5500000000000?text=Ola%2C%20gostaria%20de%20conhecer%20os%20moveis%20da%20Silva%20Moveis."
      target="_blank"
      className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-green-600 text-white shadow-2xl shadow-green-900/20 transition hover:-translate-y-1 hover:bg-green-700"
      aria-label="Falar com a Silva Moveis pelo WhatsApp"
      title="Solicitar atendimento"
    >
      <MessageCircle className="size-6" />
    </Link>
  );
}
