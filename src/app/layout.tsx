import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WhatsAppFloating } from "@/components/whatsapp-floating";
import "./globals.css";

export const metadata: Metadata = {
  title: "Silva Móveis",
  description: "Loja online Silva Móveis.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className="bg-background text-foreground antialiased"><TooltipProvider><SiteHeader />{children}<SiteFooter /><WhatsAppFloating /></TooltipProvider></body></html>;
}
