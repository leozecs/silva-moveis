import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { beginCheckout } from "../../../shared/checkout-runtime";
import CheckoutService from "../../../modules/checkout/service";
import { CHECKOUT_MODULE } from "../../../modules/checkout";
import { MedusaError } from "@medusajs/framework/utils";

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const body = req.body as { cart_id?: string; idempotency_key?: string };
  const attempt = await beginCheckout(req.scope, req.auth_context.actor_id, body.cart_id ?? "", body.idempotency_key ?? "");
  res.json({ attempt });
}
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const id = typeof req.query.id === "string" ? req.query.id : "";
  if (!/^chatm_[A-Za-z0-9]+$/.test(id)) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Identificador inválido");
  const service = req.scope.resolve<CheckoutService>(CHECKOUT_MODULE);
  const [attempt] = await service.listCheckoutAttempts({ id, customer_id: req.auth_context.actor_id });
  if (!attempt) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Tentativa não encontrada");
  res.json({ attempt });
}
