import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { cancelCheckout } from "../shared/checkout-runtime";
import CheckoutService from "../modules/checkout/service";
import { CHECKOUT_MODULE } from "../modules/checkout";

export default async function expireTestCheckouts(container: MedusaContainer) {
  if (process.env.SILVA_COMMERCE_TEST !== "true" || process.env.NODE_ENV === "production") return;
  const service = container.resolve<CheckoutService>(CHECKOUT_MODULE);
  const attempts = await service.listCheckoutAttempts({ state: ["creating", "pending", "unknown"], expires_at: { $lt: new Date() } }, { take: 50, order: { expires_at: "ASC" } });
  for (const attempt of attempts) {
    try { await cancelCheckout(container, attempt.id, null, true); }
    catch { container.resolve(ContainerRegistrationKeys.LOGGER).error(`Checkout expiration requires review: ${attempt.id}`); }
  }
}
export const config = { name: "expire-test-checkouts", schedule: "* * * * *" };
