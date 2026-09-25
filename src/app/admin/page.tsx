import { redirect } from "next/navigation";
import { getMerchantSession } from "@/lib/merchant-session";
import { MerchantDashboard } from "@/components/merchant-dashboard";

export default async function AdminPage() {
  const merchant = await getMerchantSession();
  if (!merchant) redirect("/acesso");
  return <MerchantDashboard email={merchant.email} />;
}
