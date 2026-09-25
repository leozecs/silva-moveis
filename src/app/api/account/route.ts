import { privateJson, requireCustomer, storeFailure, storeRequest } from "@/lib/store-server";
import { assertSameOrigin, readJsonObject, requireId, StoreError } from "@/lib/http-policy";
import { emptyAddress, toMedusaAddress, validateAddress, type AddressDraft } from "@/lib/checkout-contract";
import type { CustomerOrder } from "@/lib/account";

export async function GET(request: Request) {
  try {
    const customer = await requireCustomer();
    const params = new URL(request.url).searchParams;
    const section = params.get("section") ?? "profile";
    if (section === "profile") return privateJson({ customer });
    const offset = Number(params.get("offset") ?? 0);
    if (!Number.isSafeInteger(offset) || offset < 0 || offset > 100000) throw new StoreError(400, "Página inválida.");
    if (section === "addresses") return privateJson(await storeRequest(`/store/customers/me/addresses?limit=20&offset=${offset}`));
    if (section === "orders") return privateJson(await storeRequest(`/store/orders?limit=10&offset=${offset}&order=-created_at&fields=+payment_status,+fulfillment_status`));
    if (section === "order") {
      const id = requireId(params.get("id"), "order");
      const payload = await storeRequest<{ order: CustomerOrder }>(`/store/orders/${id}?fields=+customer_id,+payment_status,+fulfillment_status`);
      if (payload.order.customer_id !== customer.id) throw new StoreError(404, "Pedido não encontrado.");
      return privateJson(payload);
    }
    throw new StoreError(400, "Consulta inválida.");
  } catch (error) { return storeFailure(error); }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireCustomer();
    const body = await readJsonObject(request);
    if (body.action === "profile") {
      const allowed = ["action", "first_name", "last_name", "phone"];
      if (Object.keys(body).some((key) => !allowed.includes(key))) throw new StoreError(400, "Campo não permitido.");
      for (const key of ["first_name", "last_name", "phone"]) {
        if (typeof body[key] !== "string" || !(body[key] as string).trim() || (body[key] as string).length > 200) throw new StoreError(400, "Confira os dados pessoais.");
      }
      const phone = (body.phone as string).replace(/\D/g, "");
      if (!/^\d{10,11}$/.test(phone)) throw new StoreError(400, "Informe telefone com DDD.");
      return privateJson(await storeRequest("/store/customers/me", { method: "POST", body: JSON.stringify({ first_name: (body.first_name as string).trim(), last_name: (body.last_name as string).trim(), phone }) }));
    }
    const base = "/store/customers/me/addresses";
    if (body.action === "delete_address") {
      const id = requireId(body.id, "cuaddr");
      return privateJson(await storeRequest(`${base}/${id}`, { method: "DELETE" }));
    }
    if (body.action === "save_address") {
      if (!body.address || typeof body.address !== "object" || Array.isArray(body.address)) throw new StoreError(400, "Endereço inválido.");
      const raw = body.address as Record<string, unknown>;
      const address = { ...emptyAddress };
      for (const key of Object.keys(address) as Array<keyof AddressDraft>) {
        if (typeof raw[key] !== "string") throw new StoreError(400, "Endereço incompleto.");
        address[key] = raw[key] as string;
      }
      if (Object.keys(validateAddress(address)).length) throw new StoreError(400, "Confira os campos do endereço.");
      const path = body.id ? `${base}/${requireId(body.id, "cuaddr")}` : base;
      return privateJson(await storeRequest(path, { method: "POST", body: JSON.stringify({ ...toMedusaAddress(address), is_default_shipping: body.is_default_shipping === true, is_default_billing: body.is_default_billing === true }) }));
    }
    throw new StoreError(400, "Operação inválida.");
  } catch (error) { return storeFailure(error); }
}
