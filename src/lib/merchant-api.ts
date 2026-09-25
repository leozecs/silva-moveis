import { cookies } from "next/headers";
import { getMerchantSession } from "@/lib/merchant-session";
import { StoreError } from "@/lib/http-policy";

export async function merchantClient() {
  const merchant = await getMerchantSession();
  if (!merchant) throw new StoreError(403, "Entre com uma conta autorizada de lojista.");
  const token = (await cookies()).get("medusa_merchant_token")!.value;
  const base = (process.env.MEDUSA_BACKEND_URL ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)!.replace(/\/$/, "");
  return async function request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
    const multipart = body instanceof FormData;
    const response = await fetch(`${base}${path}`, { method, headers: { Authorization: `Bearer ${token}`, ...(!multipart ? { "Content-Type": "application/json" } : {}) }, body: body === undefined ? undefined : multipart ? body : JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(20000) });
    if (!response.ok) {
      const status = response.status >= 500 ? 503 : response.status;
      throw new StoreError(status, status === 400 ? "Confira os dados e as regras do cadastro no Medusa." : status === 409 ? "O registro mudou. Atualize antes de tentar novamente." : "Não foi possível concluir a operação no Medusa.");
    }
    return response.json();
  };
}
