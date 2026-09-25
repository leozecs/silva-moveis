import { merchantClient } from "@/lib/merchant-api";
import { assertSameOrigin, readJsonObject, requireId, StoreError } from "@/lib/http-policy";
import { privateJson, storeFailure } from "@/lib/store-server";
import type { MerchantInventory, MerchantOrder, MerchantProduct, MerchantVariant } from "@/lib/merchant-types";

function text(value: unknown, max = 200) {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new StoreError(400, "Confira os campos obrigatórios.");
  return value.trim();
}
function imageUrl(value: unknown) {
  const url = text(value, 2048);
  if (url.startsWith("/catalog-images/") && /^\/catalog-images\/\d{2}\.jpg$/.test(url)) return url;
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname))) throw new StoreError(400, "Use uma URL HTTPS para a imagem.");
  return url;
}
function price(value: unknown) {
  // The imported catalog has a known unit mismatch. Do not silently write new
  // prices until the coordinated data/storefront reconciliation is completed.
  if (process.env.MEDUSA_PRICES_VERIFIED !== "true") throw new StoreError(409, "A edição de preços está bloqueada até concluir a revisão monetária do catálogo.");
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0.01 || value > 1000000 || Math.abs(value * 100 - Math.round(value * 100)) > 0.00001) throw new StoreError(400, "Informe um preço válido em reais, com até duas casas decimais.");
  return value;
}

export async function GET(request: Request) {
  try {
    const api = await merchantClient();
    const query = new URL(request.url).searchParams;
    const resource = query.get("resource") ?? "products";
    const offset = Number(query.get("offset") ?? 0);
    if (!Number.isSafeInteger(offset) || offset < 0 || offset > 100000) throw new StoreError(400, "Página inválida.");
    const params = new URLSearchParams({ limit: "20", offset: String(offset), order: "-created_at" });
    if (query.get("q")) params.set("q", text(query.get("q"), 100));
    if (resource === "products") return privateJson(await api(`/admin/products?${params}&fields=${encodeURIComponent("+*categories")}`));
    if (resource === "product") return privateJson(await api(`/admin/products/${requireId(query.get("id"), "prod")}?fields=${encodeURIComponent("+*categories")}`));
    if (resource === "categories") return privateJson(await api("/admin/product-categories?limit=100"));
    if (resource === "settings") {
      const [locations, channels, profiles] = await Promise.all([api("/admin/stock-locations?limit=100"), api("/admin/sales-channels?limit=100"), api("/admin/shipping-profiles?limit=100")]);
      return privateJson({ locations, channels, profiles, pricesVerified: process.env.MEDUSA_PRICES_VERIFIED === "true", emailConfigured: process.env.RESEND_API_KEY ? true : false });
    }
    if (resource === "orders") {
      const period = query.get("period");
      if (period && !["all", "day", "week"].includes(period)) throw new StoreError(400, "Período inválido.");
      if (period === "day" || period === "week") params.set("created_at[$gte]", new Date(Date.now() - (period === "day" ? 1 : 7) * 86400000).toISOString());
      return privateJson(await api(`/admin/orders?${params}&fields=${encodeURIComponent("+payment_status,+fulfillment_status")}`));
    }
    if (resource === "order") return privateJson(await api(`/admin/orders/${requireId(query.get("id"), "order")}?fields=${encodeURIComponent("+payment_status,+fulfillment_status,+*fulfillments,+*fulfillments.items")}`));
    if (resource === "inventory" || resource === "notifications") {
      const inventory: MerchantInventory[] = [];
      for (let start = 0; start < 10000; start += 100) {
        const batch = await api<{ inventory_items: MerchantInventory[]; count: number }>(`/admin/inventory-items?limit=100&offset=${start}`);
        inventory.push(...batch.inventory_items);
        if (inventory.length >= batch.count) break;
        if (start === 9900) throw new StoreError(503, "Catálogo grande demais para esta consulta. Use a gestão nativa de estoque.");
      }
      const products: MerchantProduct[] = [];
      for (let start = 0; start < 10000; start += 100) {
        const batch = await api<{ products: MerchantProduct[]; count: number }>(`/admin/products?limit=100&offset=${start}&fields=id,title,thumbnail,variants.sku`);
        products.push(...batch.products);
        if (products.length >= batch.count) break;
      }
      const bySku = new Map(products.flatMap((product) => (product.variants ?? []).filter((variant) => variant.sku).map((variant) => [variant.sku, product] as const)));
      return privateJson({ inventory_items: inventory.map((item) => ({ ...item, product_id: bySku.get(item.sku)?.id, thumbnail: item.thumbnail ?? bySku.get(item.sku)?.thumbnail, title: bySku.get(item.sku)?.title ?? item.title })), checked_at: new Date().toISOString() });
    }
    throw new StoreError(400, "Consulta inválida.");
  } catch (error) { return storeFailure(error); }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const api = await merchantClient();
    const body = await readJsonObject(request);
    if (body.action === "save_category") {
      const path = body.id ? `/admin/product-categories/${requireId(body.id, "pcat")}` : "/admin/product-categories";
      return privateJson(await api(path, "POST", { name: text(body.name), ...(!body.id ? { is_active: true, is_internal: false, metadata: { storefront_filter: true } } : {}) }));
    }
    if (body.action === "delete_category") {
      const id = requireId(body.id, "pcat");
      const result = await api<{ products: unknown[] }>(`/admin/products?category_id[]=${id}&limit=1`);
      if (result.products.length) throw new StoreError(409, "Mova os produtos desta categoria antes de removê-la.");
      return privateJson(await api(`/admin/product-categories/${id}`, "DELETE"));
    }
    if (body.action === "save_product") {
      const title = text(body.title);
      const description = typeof body.description === "string" && body.description.length <= 5000 ? body.description : "";
      if (!Array.isArray(body.category_ids) || body.category_ids.length > 30 || !Array.isArray(body.images) || body.images.length > 20) throw new StoreError(400, "Categorias ou imagens inválidas.");
      const categories = body.category_ids.map((id) => ({ id: requireId(id, "pcat") }));
      const images = body.images.map((url) => ({ url: imageUrl(url) }));
      if (body.id) {
        const id = requireId(body.id, "prod");
        const { product } = await api<{ product: MerchantProduct }>(`/admin/products/${id}`);
        if (body.updated_at !== product.updated_at) throw new StoreError(409, "Produto alterado por outra sessão. Reabra o cadastro.");
        return privateJson(await api(`/admin/products/${id}`, "POST", { title, description, categories, images, thumbnail: images[0]?.url ?? null }));
      }
      const amount = price(body.price);
      return privateJson(await api("/admin/products", "POST", { title, description, categories, images, thumbnail: images[0]?.url, status: "draft", shipping_profile_id: requireId(body.shipping_profile_id, "sp"), sales_channels: [{ id: requireId(body.sales_channel_id, "sc") }], options: [{ title: "Modelo", values: ["Padrão"] }], variants: [{ title: "Padrão", sku: text(body.sku, 100), manage_inventory: true, allow_backorder: false, options: { Modelo: "Padrão" }, prices: [{ currency_code: "brl", amount }] }] }));
    }
    if (body.action === "product_status") {
      const id = requireId(body.id, "prod");
      if (!["published", "draft"].includes(String(body.status))) throw new StoreError(400, "Status inválido.");
      const { product } = await api<{ product: MerchantProduct }>(`/admin/products/${id}`);
      if (body.updated_at !== product.updated_at) throw new StoreError(409, "Produto alterado. Atualize a página.");
      return privateJson(await api(`/admin/products/${id}`, "POST", { status: body.status }));
    }
    if (body.action === "delete_product") {
      const id = requireId(body.id, "prod");
      const { product } = await api<{ product: MerchantProduct }>(`/admin/products/${id}`);
      if (body.confirmation !== product.title || product.status !== "draft") throw new StoreError(409, "Despublique primeiro e confirme o nome exato do produto.");
      return privateJson(await api(`/admin/products/${id}`, "DELETE"));
    }
    if (body.action === "save_option") {
      const id = requireId(body.product_id, "prod");
      if (!Array.isArray(body.values) || !body.values.length || body.values.length > 50) throw new StoreError(400, "Informe os valores da opção.");
      return privateJson(await api(`/admin/products/${id}/options`, "POST", { title: text(body.title), values: body.values.map((value) => text(value, 100)) }));
    }
    if (body.action === "save_variant") {
      const id = requireId(body.product_id, "prod");
      const variantId = body.id ? requireId(body.id, "variant") : null;
      if (!body.options || typeof body.options !== "object" || Array.isArray(body.options)) throw new StoreError(400, "Opções inválidas.");
      const options = Object.fromEntries(Object.entries(body.options).map(([key, value]) => [text(key), text(value)]));
      const amount = price(body.price);
      const hex = body.color_hex;
      if (hex && (typeof hex !== "string" || !/^#[0-9a-f]{6}$/i.test(hex))) throw new StoreError(400, "Cor inválida.");
      const existing = variantId ? await api<{ variant: MerchantVariant }>(`/admin/products/${id}/variants/${variantId}`) : null;
      const oldPrice = existing?.variant.prices?.find((item) => item.currency_code === "brl");
      return privateJson(await api(`/admin/products/${id}/variants${variantId ? `/${variantId}` : ""}`, "POST", { title: text(body.title), sku: text(body.sku, 100), options, manage_inventory: true, allow_backorder: false, metadata: { ...existing?.variant.metadata, ...(hex ? { color_hex: hex } : {}) }, prices: [...(existing?.variant.prices ?? []).filter((item) => item.currency_code !== "brl").map((item) => ({ id: item.id, currency_code: item.currency_code, amount: item.amount })), { ...(oldPrice ? { id: oldPrice.id } : {}), currency_code: "brl", amount }] }));
    }
    if (body.action === "variant_images") {
      const id = requireId(body.product_id, "prod");
      const variantId = requireId(body.variant_id, "variant");
      if (!Array.isArray(body.image_ids) || body.image_ids.length > 20) throw new StoreError(400, "Imagens inválidas.");
      const { product } = await api<{ product: MerchantProduct }>(`/admin/products/${id}`);
      const variant = product.variants?.find((item) => item.id === variantId);
      if (!variant) throw new StoreError(404, "Variante não encontrada.");
      const ids = body.image_ids.map((value) => requireId(value, "img"));
      if (ids.some((value) => !product.images?.some((item) => item.id === value))) throw new StoreError(400, "Escolha imagens deste produto.");
      return privateJson(await api(`/admin/products/${id}/variants/${variantId}/images/batch`, "POST", { add: ids.filter((value) => !variant.images?.some((item) => item.id === value)), remove: (variant.images ?? []).filter((item) => !ids.includes(item.id)).map((item) => item.id) }));
    }
    if (body.action === "set_stock") {
      const id = requireId(body.id, "iitem");
      const location = requireId(body.location_id, "sloc");
      const quantity = body.quantity;
      if (typeof quantity !== "number" || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > 1000000) throw new StoreError(400, "Estoque inválido.");
      const { inventory_item } = await api<{ inventory_item: MerchantInventory }>(`/admin/inventory-items/${id}`);
      const level = inventory_item.location_levels.find((item) => item.location_id === location);
      if (level && Number(body.previous_quantity) !== Number(level.stocked_quantity)) throw new StoreError(409, "Estoque alterado. Atualize antes de ajustar.");
      if (level && quantity < Number(level.reserved_quantity)) throw new StoreError(409, "O estoque não pode ficar abaixo da quantidade reservada.");
      return privateJson(await api(`/admin/inventory-items/${id}/location-levels${level ? `/${location}` : ""}`, "POST", { stocked_quantity: quantity, ...(!level ? { location_id: location } : {}) }));
    }
    if (body.action === "order_stage") {
      const id = requireId(body.id, "order");
      const { order } = await api<{ order: MerchantOrder }>(`/admin/orders/${id}?fields=${encodeURIComponent("+payment_status,+fulfillment_status,+*fulfillments,+*fulfillments.items")}`);
      if (order.status === "canceled" || order.payment_status !== "captured") throw new StoreError(409, "Somente pedidos com pagamento confirmado podem avançar na entrega.");
      if (body.confirmed_customer !== true) throw new StoreError(400, "Confira e confirme os dados do cliente.");
      if (body.stage === "processing") {
        if (order.fulfillments?.some((item) => !item.canceled_at)) throw new StoreError(409, "Este pedido já entrou em processamento. Atualize a lista.");
        return privateJson(await api(`/admin/orders/${id}/fulfillments`, "POST", { location_id: requireId(body.location_id, "sloc"), items: order.items.map((item) => ({ id: item.id, quantity: Number(item.quantity) })), no_notification: false }));
      }
      const fulfillmentId = requireId(body.fulfillment_id, "ful");
      const fulfillment = order.fulfillments?.find((item) => item.id === fulfillmentId && !item.canceled_at);
      if (!fulfillment) throw new StoreError(404, "Entrega não encontrada neste pedido.");
      if (body.stage === "shipped") {
        if (fulfillment.shipped_at) throw new StoreError(409, "Entrega já enviada.");
        return privateJson(await api(`/admin/orders/${id}/fulfillments/${fulfillmentId}/shipments`, "POST", { items: (fulfillment.items ?? []).map((item) => ({ id: item.line_item_id, quantity: Number(item.quantity) })), no_notification: false }));
      }
      if (body.stage === "delivered") {
        if (!fulfillment.shipped_at || fulfillment.delivered_at) throw new StoreError(409, "Confira o status atual da entrega.");
        return privateJson(await api(`/admin/orders/${id}/fulfillments/${fulfillmentId}/mark-as-delivered`, "POST", { no_notification: false }));
      }
      throw new StoreError(400, "Etapa inválida. Pagamentos são confirmados pelo provedor, não manualmente.");
    }
    throw new StoreError(400, "Operação inválida.");
  } catch (error) { return storeFailure(error); }
}
