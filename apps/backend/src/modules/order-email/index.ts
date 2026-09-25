import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import OrderEmailProvider from "./service";

export default ModuleProvider(Modules.NOTIFICATION, { services: [OrderEmailProvider] });
