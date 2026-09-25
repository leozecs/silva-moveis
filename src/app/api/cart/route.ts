import { assertSameOrigin, readJsonObject, requireId, requireQuantity, StoreError } from "@/lib/http-policy";
import { privateJson, requireCustomer, storeFailure, storeRequest } from "@/lib/store-server";
import type { StoreCart } from "@/lib/cart";
import { emptyAddress, PAYMENT_METHODS, TERMS_VERSION, toMedusaAddress, validateAddress, type AddressDraft } from "@/lib/checkout-contract";

const addressFields = "?fields=%2Bshipping_address.metadata,%2Bbilling_address.metadata";

async function ownedCart(id: string, customerId: string) {
  const { cart } = await storeRequest<{ cart: StoreCart }>(`/store/carts/${id}${addressFields}`);
  if (cart.customer_id !== customerId) throw new StoreError(403, "Este carrinho não pertence à sua conta.");
  if (cart.completed_at) throw new StoreError(409, "Este carrinho já foi concluído.", "cart_completed");
  return cart;
}

function address(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new StoreError(400, "Endereço inválido.");
  const object = value as Record<string, unknown>;
  const result = { ...emptyAddress };
  for (const key of Object.keys(result) as Array<keyof AddressDraft>) {
    if (typeof object[key] !== "string") throw new StoreError(400, "Endereço incompleto.");
    result[key] = object[key] as string;
  }
  if (Object.keys(validateAddress(result)).length) throw new StoreError(400, "Confira os campos do endereço.");
  return toMedusaAddress(result);
}

export async function GET(request: Request) {
  try {
    const customer = await requireCustomer();
    const id = new URL(request.url).searchParams.get("cart_id");
    if (!id) return privateJson({ cart: null });
    return privateJson({ cart: await ownedCart(requireId(id, "cart"), customer.id) });
  } catch (error) { return storeFailure(error); }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJsonObject(request);
    const customer = await requireCustomer();
    if (body.action === "create") {
      const region_id = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID;
      if (!region_id) throw new StoreError(503, "Região da loja indisponível.");
      return privateJson(await storeRequest(`/store/carts${addressFields}`, { method: "POST", body: JSON.stringify({ region_id, email: customer.email }) }));
    }
    const id = requireId(body.cartId, "cart");
    const cart = await ownedCart(id, customer.id);
    const path = `/store/carts/${id}`;
    const post = (url: string, data: unknown, method = "POST") => storeRequest(`${url}${addressFields}`, { method, body: JSON.stringify(data) });
    switch (body.action) {
      case "add":
        return privateJson(await post(`${path}/line-items`, { variant_id: requireId(body.variant_id, "variant"), quantity: requireQuantity(body.quantity ?? 1) }));
      case "update":
      case "remove": {
        const line = requireId(body.lineItemId, "cali");
        if (!cart.items?.some((item) => item.id === line)) throw new StoreError(404, "Item não encontrado neste carrinho.");
        if (body.action === "update") return privateJson(await post(`${path}/line-items/${line}`, { quantity: requireQuantity(body.quantity) }));
        await storeRequest(`${path}/line-items/${line}`, { method: "DELETE" });
        return privateJson({ cart: await ownedCart(id, customer.id) });
      }
      case "update_cart": {
        if (!body.data || typeof body.data !== "object" || Array.isArray(body.data)) throw new StoreError(400, "Dados inválidos.");
        const data = body.data as Record<string, unknown>;
        const allowed = ["shipping", "billing", "same_billing_address", "payment_method", "terms_accepted"];
        if (Object.keys(data).some((key) => !allowed.includes(key))) throw new StoreError(400, "Campo não permitido.");
        const payload: Record<string, unknown> = { email: customer.email };
        if (data.shipping) {
          payload.shipping_address = address(data.shipping);
          payload.billing_address = data.same_billing_address === true ? payload.shipping_address : address(data.billing);
        }
        const metadata: Record<string, unknown> = { ...cart.metadata };
        if (data.payment_method !== undefined) {
          if (!(PAYMENT_METHODS as readonly unknown[]).includes(data.payment_method)) throw new StoreError(400, "Selecione uma forma de pagamento válida.");
          metadata.payment_method = data.payment_method;
        }
        if (data.terms_accepted !== undefined) {
          if (typeof data.terms_accepted !== "boolean") throw new StoreError(400, "Aceite inválido.");
          metadata.terms_acceptance = data.terms_accepted ? { version: TERMS_VERSION, accepted_at: new Date().toISOString(), customer_id: customer.id } : null;
        }
        payload.metadata = metadata;
        return privateJson(await post(path, payload));
      }
      case "apply_coupon":
      case "remove_coupon": {
        if (typeof body.code !== "string" || !body.code.trim() || body.code.length > 100) throw new StoreError(400, "Informe um cupom válido.");
        await post(`${path}/promotions`, { promo_codes: [body.code.trim()] }, body.action === "remove_coupon" ? "DELETE" : "POST");
        return privateJson({ cart: await ownedCart(id, customer.id) });
      }
      case "shipping_options":
        return privateJson(await storeRequest(`/store/shipping-options?cart_id=${encodeURIComponent(id)}`));
      case "add_shipping":
        return privateJson(await post(`${path}/shipping-methods`, { option_id: requireId(body.shipping_option_id, "so") }));
      // Enabled after the attempt workflow, reservation and test provider are verified.
      case "payment_collection": case "payment_session": case "complete":
        throw new StoreError(409, "Pagamento ainda não habilitado. Nenhuma cobrança foi realizada.", "payment_unavailable");
      default: throw new StoreError(400, "Operação inválida.");
    }
  } catch (error) { return storeFailure(error); }
}
