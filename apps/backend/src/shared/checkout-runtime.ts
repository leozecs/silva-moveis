import { createHash } from "node:crypto";
import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils";
import { cancelOrderWorkflow, completeCartWorkflow, createPaymentCollectionForCartWorkflow, createPaymentSessionsWorkflow } from "@medusajs/medusa/core-flows";
import CheckoutService from "../modules/checkout/service";
import { CHECKOUT_MODULE } from "../modules/checkout";

export function assertTestCheckout() {
  if (process.env.SILVA_COMMERCE_TEST !== "true" || process.env.NODE_ENV === "production") {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Checkout de teste indisponível neste ambiente. Nenhuma cobrança foi realizada.");
  }
}

export async function beginCheckout(container: MedusaContainer, actor: string, cartId: string, key: string) {
  assertTestCheckout();
  if (!/^cart_[a-zA-Z0-9]+$/.test(cartId) || !/^[a-zA-Z0-9_-]{16,100}$/.test(key)) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Identificadores inválidos");
  const locking = container.resolve(Modules.LOCKING);
  return locking.execute(`silva:cart:${cartId}`, async () => {
    const service = container.resolve<CheckoutService>(CHECKOUT_MODULE);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const { data: carts } = await query.graph({ entity: "cart", fields: ["id", "customer_id", "completed_at", "currency_code", "total", "metadata", "*items", "*shipping_address", "*billing_address", "*shipping_methods", "payment_collection.id", "order.id"], filters: { id: cartId } });
    const cart = carts[0];
    if (!cart || cart.customer_id !== actor) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Carrinho não encontrado");
    const method = cart.metadata?.payment_method;
    if (!["credit_card", "pix", "boleto"].includes(String(method))) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Selecione a forma de pagamento");
    const terms = cart.metadata?.terms_acceptance as { version?: string; customer_id?: string } | undefined;
    if (terms?.version !== "2026-09-23" || terms?.customer_id !== actor) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Aceite os termos atuais");
    if (cart.currency_code !== "brl" || !cart.items?.length || !Number.isFinite(Number(cart.total)) || Number(cart.total) <= 0) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Carrinho inválido");
    if (!cart.shipping_methods?.length) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Selecione a entrega antes de finalizar");
    const address = cart.shipping_address;
    if (!address || address.country_code !== "br" || !address.address_1 || !address.city || !/^\d{8}$/.test(address.postal_code ?? "")) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Confira o endereço");
    const fingerprint = createHash("sha256").update(JSON.stringify({
      currency: cart.currency_code, total: cart.total, method,
      items: cart.items.map((item) => [item.variant_id, item.quantity, item.unit_price]).sort(),
      shipping: cart.shipping_methods.map((item) => [item.shipping_option_id, item.amount]).sort(),
      address: [address.address_1, address.address_2, address.postal_code, address.city, address.province],
    })).digest("hex");
    let [attempt] = await service.listCheckoutAttempts({ cart_id: cartId });
    if (attempt) {
      if (attempt.customer_id !== actor || attempt.idempotency_key !== key || attempt.fingerprint !== fingerprint) throw new MedusaError(MedusaError.Types.CONFLICT, "Tentativa já existe com outro contexto. Consulte o estado antes de repetir.");
      if (attempt.order_id || ["canceled", "expired", "paid"].includes(attempt.state)) return attempt;
    } else {
      attempt = await service.createCheckoutAttempts({ cart_id: cartId, customer_id: actor, idempotency_key: key, fingerprint, method: method as "credit_card" | "pix" | "boleto", amount: cart.total, currency_code: "brl", expires_at: new Date(Date.now() + 15 * 60 * 1000), test_only: true });
    }
    try {
      // Reconcile a previous completion whose response/persistence was lost.
      const linkedOrder = (cart as unknown as { order?: { id?: string } }).order;
      if (linkedOrder?.id) return await service.updateCheckoutAttempts({ id: attempt.id, order_id: linkedOrder.id, state: "pending" });
      const collectionId = cart.payment_collection?.id ?? (await createPaymentCollectionForCartWorkflow(container).run({ input: { cart_id: cartId } })).result.id;
      const payment = container.resolve(Modules.PAYMENT);
      let [session] = await payment.listPaymentSessions({ payment_collection_id: collectionId, provider_id: "pp_silva-test_silva-test" });
      if (!session) {
        await createPaymentSessionsWorkflow(container).run({ input: { payment_collection_id: collectionId, provider_id: "pp_silva-test_silva-test", customer_id: actor, data: { method, attempt_id: attempt.id } } });
        [session] = await payment.listPaymentSessions({ payment_collection_id: collectionId, provider_id: "pp_silva-test_silva-test" });
      }
      if (!session || Number(session.amount) !== Number(cart.total) || session.currency_code !== "brl") throw new MedusaError(MedusaError.Types.CONFLICT, "Valor da sessão difere da revisão");
      await service.updateCheckoutAttempts({ id: attempt.id, payment_session_id: session.id });
      // Medusa 2.20 supports pending_authorization: the pending order owns the
      // canonical reservations. No temporary-to-order reservation gap is needed.
      const { result } = await completeCartWorkflow(container).run({ input: { id: cartId } });
      return await service.updateCheckoutAttempts({ id: attempt.id, order_id: result.id, state: "pending", last_error: null });
    } catch (error) {
      await service.updateCheckoutAttempts({ id: attempt.id, state: "unknown", last_error: "checkout_completion_requires_reconciliation" });
      throw error;
    }
  }, { timeout: 30 });
}

export async function cancelCheckout(container: MedusaContainer, attemptId: string, actor: string | null, expired = false) {
  assertTestCheckout();
  const service = container.resolve<CheckoutService>(CHECKOUT_MODULE);
  const initial = await service.retrieveCheckoutAttempt(attemptId);
  if (actor && initial.customer_id !== actor) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Tentativa não encontrada");
  return container.resolve(Modules.LOCKING).execute(`silva:cart:${initial.cart_id}`, async () => {
    const attempt = await service.retrieveCheckoutAttempt(attemptId);
    if (["expired", "canceled"].includes(attempt.state)) return attempt;
    if (attempt.state === "paid") throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Pagamento confirmado exige fluxo de reembolso");
    const payment = container.resolve(Modules.PAYMENT);
    if (attempt.payment_session_id) {
      const session = await payment.retrievePaymentSession(attempt.payment_session_id, { relations: ["payment"] });
      if (session.payment?.captured_at || session.status === "authorized") throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Reconcilie o pagamento antes de cancelar");
    }
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const { data } = await query.graph({ entity: "cart", fields: ["id", "order.id"], filters: { id: attempt.cart_id } });
    const orderId = attempt.order_id ?? (data[0] as unknown as { order?: { id?: string } })?.order?.id;
    if (orderId) await cancelOrderWorkflow(container).run({ input: { order_id: orderId } });
    else if (attempt.payment_session_id) await payment.deletePaymentSession(attempt.payment_session_id);
    return await service.updateCheckoutAttempts({ id: attempt.id, order_id: orderId ?? null, state: expired ? "expired" : "canceled" });
  }, { timeout: 30 });
}
