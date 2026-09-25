import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { StoreError } from "@/lib/http-policy";

export async function storeRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = (process.env.MEDUSA_BACKEND_URL ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)?.replace(/\/$/, "");
  if (!base) throw new StoreError(503, "A loja está temporariamente indisponível.");
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) headers.set("x-publishable-api-key", process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY);
  const token = (await cookies()).get("medusa_customer_token")?.value;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try { response = await fetch(`${base}${path}`, { ...init, headers, cache: "no-store", signal: AbortSignal.timeout(15000) }); }
  catch { throw new StoreError(503, "Não conseguimos acessar a loja agora. Seus dados foram preservados.", "store_unavailable"); }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const status = response.status >= 500 ? 503 : response.status;
    const messages: Record<number, string> = {
      400: "Não foi possível aplicar a alteração. Confira os dados, o cupom e a disponibilidade dos itens.",
      401: "Entre na sua conta para continuar.", 403: "Você não tem acesso a estes dados.",
      404: "O registro solicitado não foi encontrado.", 409: "O carrinho mudou. Atualize e revise antes de continuar.",
      422: "Confira os dados informados.", 429: "Muitas solicitações. Aguarde um instante e tente novamente.",
      503: "A loja está temporariamente indisponível. Tente novamente em instantes.",
    };
    throw new StoreError(status, messages[status] ?? "Não foi possível concluir a operação.", "store_request_failed");
  }
  if (!payload) throw new StoreError(503, "A loja retornou uma resposta inválida.");
  return payload as T;
}

export async function requireCustomer() {
  if (!(await cookies()).get("medusa_customer_token")?.value) throw new StoreError(401, "Entre na sua conta para continuar.");
  const { customer } = await storeRequest<{ customer: { id: string; email: string; first_name?: string; last_name?: string; phone?: string } }>("/store/customers/me");
  if (!customer?.id) throw new StoreError(401, "Entre novamente na sua conta.");
  return customer;
}

export function storeFailure(error: unknown) {
  const known = error instanceof StoreError ? error : new StoreError(500, "Não foi possível concluir a operação.");
  return NextResponse.json({ message: known.message, code: known.code }, { status: known.status, headers: { "Cache-Control": "private, no-store" } });
}

export function privateJson(data: unknown) {
  return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
}
