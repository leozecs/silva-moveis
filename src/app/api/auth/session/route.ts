import { getMerchantSession } from "@/lib/merchant-session";
import { privateJson, requireCustomer } from "@/lib/store-server";

export async function GET() {
  if (await getMerchantSession()) return privateJson({ authenticated: true, role: "merchant", href: "/admin" });
  try {
    await requireCustomer();
    return privateJson({ authenticated: true, role: "customer", href: "/minha-conta" });
  } catch { return privateJson({ authenticated: false, href: "/acesso" }); }
}
