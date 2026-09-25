import { MedusaService } from "@medusajs/framework/utils";
import { CheckoutAttempt } from "./models/checkout-attempt";

export default class CheckoutService extends MedusaService({ CheckoutAttempt }) {}
