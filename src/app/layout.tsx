import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WhatsAppFloating } from "@/components/whatsapp-floating";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Silva Moveis | Moveis premium para areas externas",
  description:
    "Loja virtual demonstrativa da Silva Moveis: moveis externos premium em fibra sintetica e corda nautica.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="bg-background text-foreground antialiased">
        <TooltipProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <WhatsAppFloating />
        </TooltipProvider>
      </body>
    </html>
  );
}
