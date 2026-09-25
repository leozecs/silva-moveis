import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMerchantSession } from "@/lib/merchant-session";
import { CustomerLogoutButton } from "@/components/customer-logout-button";

export default async function AdminPage() {
  const merchant = await getMerchantSession();
  if (!merchant) redirect("/acesso");
  const base = (process.env.MEDUSA_BACKEND_URL ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)?.replace(/\/$/, "");
  const adminUrl = process.env.MEDUSA_ADMIN_URL ?? `${base}/app`;
  const token = (await cookies()).get("medusa_merchant_token")!.value;
  const sections = [
    { label: "Produtos", api: "products", path: "products" },
    { label: "Pedidos", api: "orders", path: "orders" },
    { label: "Clientes", api: "customers", path: "customers" },
    { label: "Itens de estoque", api: "inventory-items", path: "inventory" },
  ];
  const counts = await Promise.all(sections.map(async (section) => {
    try {
      const response = await fetch(`${base}/admin/${section.api}?limit=1`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(10000) });
      if (!response.ok) return null;
      const payload = await response.json();
      return typeof payload.count === "number" ? payload.count : null;
    } catch { return null; }
  }));
  return <main className="container-premium py-12">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-muted-foreground">{merchant.email}</p><h1 className="mt-2 text-4xl font-semibold">Painel do lojista</h1></div><CustomerLogoutButton /></div>
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{sections.map((section, index) => <Link key={section.api} href={`${adminUrl}/${section.path}`} className="rounded-xl border bg-white p-6 transition hover:border-gold"><h2 className="font-medium">{section.label}</h2><p className="mt-4 text-3xl font-semibold">{counts[index] ?? "Indisponível"}</p><p className="mt-4 text-sm underline">Abrir gestão</p></Link>)}</div>
    <p className="mt-6 text-sm text-muted-foreground">Os dados acima vêm da sua loja. As ferramentas de gestão abrem o painel administrativo, que pode solicitar autenticação própria.</p>
  </main>;
}
