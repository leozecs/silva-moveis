import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { cancelCheckout } from "../../../../../shared/checkout-runtime";

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.json({ attempt: await cancelCheckout(req.scope, req.params.id, req.auth_context.actor_id) });
}
