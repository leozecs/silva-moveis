import { model } from "@medusajs/framework/utils";

export const CheckoutAttempt = model.define("checkout_attempt", {
  id: model.id({ prefix: "chatm" }).primaryKey(),
  cart_id: model.text().unique(),
  customer_id: model.text().index(),
  idempotency_key: model.text().unique(),
  fingerprint: model.text(),
  method: model.enum(["credit_card", "pix", "boleto"]),
  amount: model.bigNumber(),
  currency_code: model.text(),
  state: model.enum(["creating", "pending", "paid", "failed", "canceled", "expired", "unknown"]).default("creating"),
  order_id: model.text().nullable(),
  payment_session_id: model.text().nullable(),
  expires_at: model.dateTime().index(),
  last_error: model.text().nullable(),
  test_only: model.boolean().default(true),
});
