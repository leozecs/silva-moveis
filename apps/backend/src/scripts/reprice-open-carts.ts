import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { refreshCartItemsWorkflow } from "@medusajs/medusa/core-flows";

// One-time companion to ops/normalize-catalog-prices.sql. Do not modify
// cart item prices directly: native workflows also refresh promotions/tax.
export default async function repriceOpenCarts({ container }: ExecArgs) {
  if (process.env.SILVA_PRICE_MIGRATION !== "20260927") {
    throw new Error("Explicit SILVA_PRICE_MIGRATION=20260927 is required");
  }
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: carts } = await query.graph({
    entity: "cart", fields: ["id", "completed_at"],
    filters: { completed_at: null }, pagination: { take: 101 },
  });
  if (carts.length > 100) throw new Error("Too many carts for this audited migration");
  for (const cart of carts) {
    await refreshCartItemsWorkflow(container).run({ input: { cart_id: cart.id, force_refresh: true } });
    const { data: updated } = await query.graph({
      entity: "cart", fields: ["id", "total", "items.unit_price", "items.quantity"],
      filters: { id: cart.id },
    });
    console.log(JSON.stringify({ cart_id: cart.id, total: updated[0]?.total, item_count: updated[0]?.items?.length ?? 0 }));
  }
  console.log(JSON.stringify({ repriced_carts: carts.length }));
}
