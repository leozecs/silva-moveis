import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StorefrontLiveRefresh } from "@/components/storefront-live-refresh";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WhatsAppFloating } from "@/components/whatsapp-floating";
import { CartProvider } from "@/components/cart-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { StorefrontAnalytics } from "@/components/storefront-analytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "Silva Móveis",
  description: "Móveis para áreas externas, varandas e ambientes com acabamento artesanal.",
  metadataBase: new URL("https://silvamoveis.com.br"),
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "pt_BR", siteName: "Silva Móveis", title: "Silva Móveis", description: "Móveis para ambientes que acolhem.", url: "/" },
  twitter: { card: "summary_large_image", title: "Silva Móveis", description: "Móveis para ambientes que acolhem." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className="bg-background text-foreground antialiased"><TooltipProvider><CartProvider><Analytics /><StorefrontAnalytics /><StorefrontLiveRefresh /><SiteHeader />{children}<SiteFooter /><WhatsAppFloating /><CookieConsent /></CartProvider></TooltipProvider></body></html>;
}
