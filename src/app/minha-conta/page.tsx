import { AccountDashboard } from "@/components/account-dashboard";
import { getMerchantSession } from "@/lib/merchant-session";
import { redirect } from "next/navigation";

export default async function MinhaContaPage() {
  if (await getMerchantSession()) redirect("/admin");
  return <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"><h1 className="text-4xl font-semibold">Minha conta</h1><p className="mt-4 text-muted-foreground">Acompanhe suas compras e mantenha seus dados atualizados.</p><AccountDashboard /></main>;
}
