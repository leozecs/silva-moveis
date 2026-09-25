import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils";
import { createApiKeysWorkflow, createProductsWorkflow, createRegionsWorkflow, createStockLocationsWorkflow, linkSalesChannelsToStockLocationWorkflow } from "@medusajs/medusa/core-flows";

export default async function seed({ container }: ExecArgs) {
  const url = new URL(process.env.DATABASE_URL || "http://invalid");
  if (process.env.SILVA_COMMERCE_TEST !== "true" || url.hostname !== "127.0.0.1" || url.pathname !== "/silva_commerce_test") {
    throw new Error("This fixture may only run against the isolated local test database");
  }
  const sales = container.resolve(Modules.SALES_CHANNEL);
  const channels = await sales.listSalesChannels({ name: "Silva integração isolada" });
  const channel = channels[0] ?? await sales.createSalesChannels({ name: "Silva integração isolada" });
  const stores = container.resolve(Modules.STORE);
  const [store] = await stores.listStores();
  await stores.updateStores(store.id, { default_sales_channel_id: channel.id, supported_currencies: [{ currency_code: "brl", is_default: true }] });
  const regions = container.resolve(Modules.REGION);
  const existing = await regions.listRegions({ name: "Brasil teste" });
  const region = existing[0] ?? (await createRegionsWorkflow(container).run({ input: { regions: [{ name: "Brasil teste", currency_code: "brl", countries: ["br"] }] } })).result[0];
  const apiKeys = container.resolve(Modules.API_KEY);
  const keys = await apiKeys.listApiKeys({ title: "Silva teste isolado" });
  const key = keys[0] ?? (await createApiKeysWorkflow(container).run({ input: { api_keys: [{ title: "Silva teste isolado", type: "publishable", created_by: "integration-test" }] } })).result[0];
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  if (!keys.length) await link.create({ [Modules.API_KEY]: { publishable_key_id: key.id }, [Modules.SALES_CHANNEL]: { sales_channel_id: channel.id } });
  const locations = container.resolve(Modules.STOCK_LOCATION);
  const currentLocations = await locations.listStockLocations({ name: "Estoque isolado" });
  const location = currentLocations[0] ?? (await createStockLocationsWorkflow(container).run({ input: { locations: [{ name: "Estoque isolado" }] } })).result[0];
  await linkSalesChannelsToStockLocationWorkflow(container).run({ input: { id: location.id, add: [channel.id] } });
  const fulfillment = container.resolve(Modules.FULFILLMENT);
  const profiles = await fulfillment.listShippingProfiles({ type: "default" });
  const profile = profiles[0] ?? await fulfillment.createShippingProfiles({ name: "Teste", type: "default" });
  const products = container.resolve(Modules.PRODUCT);
  const currentProducts = await products.listProducts({ handle: "produto-integracao" });
  const product = currentProducts[0] ?? (await createProductsWorkflow(container).run({ input: { products: [{
    title: "Produto de integração (não comercial)", handle: "produto-integracao", status: ProductStatus.PUBLISHED,
    shipping_profile_id: profile.id, sales_channels: [{ id: channel.id }],
    options: [{ title: "Modelo", values: ["Único"] }],
    variants: [{ title: "Único", sku: "SILVA-INTEGRATION-ONLY", manage_inventory: true, allow_backorder: false, options: { Modelo: "Único" }, prices: [{ currency_code: "brl", amount: 50.90 }] }],
  }] } })).result[0];
  const inventory = container.resolve(Modules.INVENTORY);
  const items = await inventory.listInventoryItems({ sku: "SILVA-INTEGRATION-ONLY" });
  if (!items[0]) throw new Error("Product workflow did not create inventory");
  const levels = await inventory.listInventoryLevels({ inventory_item_id: items[0].id, location_id: location.id });
  if (!levels.length) await inventory.createInventoryLevels({ inventory_item_id: items[0].id, location_id: location.id, stocked_quantity: 10 });
  console.log(JSON.stringify({ region_id: region.id, publishable_key: key.token, product_id: product.id, channel_id: channel.id, location_id: location.id }));
}
