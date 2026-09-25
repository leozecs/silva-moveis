import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import TestPaymentProvider from "./service";

export default ModuleProvider(Modules.PAYMENT, { services: [TestPaymentProvider] });
