import { Module } from "@medusajs/framework/utils";
import CheckoutService from "./service";

export const CHECKOUT_MODULE = "silva_checkout";
export default Module(CHECKOUT_MODULE, { service: CheckoutService });
