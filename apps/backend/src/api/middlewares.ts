import { authenticate, defineMiddlewares, type AuthenticatedMedusaRequest, type MedusaNextFunction, type MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";

// Store API IDs are not authorization. Enforce the same ownership rule even
// when a caller bypasses the Next.js adapter and calls Medusa directly.
async function requireOwnership(req: AuthenticatedMedusaRequest, _res: MedusaResponse, next: MedusaNextFunction) {
  const actor = req.auth_context?.actor_id;
  if (!actor) throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Customer authentication required");
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const path = req.originalUrl.split("?")[0];
  const cartId = path.match(/^\/store\/carts\/(cart_[A-Za-z0-9]+)/)?.[1];
  const orderId = path.match(/^\/store\/orders\/(order_[A-Za-z0-9]+)/)?.[1];
  const collectionId = path.match(/^\/store\/payment-collections\/(pay_col_[A-Za-z0-9]+)/)?.[1];
  if (cartId) {
    const { data } = await query.graph({ entity: "cart", fields: ["id", "customer_id", "completed_at"], filters: { id: cartId } });
    if (!data[0] || data[0].customer_id !== actor) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Cart not found");
    if (req.method !== "GET" && data[0].completed_at) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Cart already completed");
  }
  if (orderId) {
    const { data } = await query.graph({ entity: "order", fields: ["id", "customer_id"], filters: { id: orderId } });
    if (!data[0] || data[0].customer_id !== actor) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found");
  }
  if (path.startsWith("/store/payment-collections")) {
    const body = req.body as { cart_id?: string } | undefined;
    if (collectionId) {
      const { data } = await query.graph({ entity: "payment_collection", fields: ["id", "cart.customer_id"], filters: { id: collectionId } });
      if (!data[0] || (data[0] as unknown as { cart?: { customer_id?: string } }).cart?.customer_id !== actor) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Payment collection not found");
    } else if (req.method === "POST") {
      if (!body?.cart_id) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Cart is required");
      const { data } = await query.graph({ entity: "cart", fields: ["id", "customer_id"], filters: { id: body.cart_id } });
      if (!data[0] || data[0].customer_id !== actor) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Cart not found");
    }
  }
  next();
}

export default defineMiddlewares({
  routes: [{ matcher: /^\/store\/checkout(\/.*)?$/, method: ["GET", "POST"], middlewares: [authenticate("customer", ["session", "bearer"])] }, {
    matcher: /^\/store\/(carts|orders|payment-collections)(\/.*)?$/,
    method: ["GET", "POST", "DELETE"],
    middlewares: [authenticate("customer", ["session", "bearer"]), requireOwnership],
  }],
});
