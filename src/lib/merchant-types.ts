export type MerchantCategory = { id: string; name: string; metadata?: Record<string, unknown> | null };
export type MerchantImage = { id: string; url: string };
export type MerchantVariant = { id: string; title: string; sku?: string | null; manage_inventory: boolean; allow_backorder: boolean; metadata?: Record<string, unknown> | null; prices?: Array<{ id: string; currency_code: string; amount: number }>; options?: Array<{ option_id: string; value: string }>; images?: MerchantImage[] };
export type MerchantProduct = { id: string; title: string; description?: string | null; thumbnail?: string | null; status: string; updated_at: string; categories?: MerchantCategory[]; images?: MerchantImage[]; variants?: MerchantVariant[]; options?: Array<{ id: string; title: string; values: Array<{ value: string }> }>; metadata?: Record<string, unknown> | null };
export type MerchantInventory = { id: string; sku?: string; title?: string; thumbnail?: string | null; product_id?: string; location_levels: Array<{ location_id: string; stocked_quantity: number; reserved_quantity: number; available_quantity?: number }> };
export type MerchantOrder = { id: string; display_id: number; email: string; created_at: string; updated_at: string; status: string; payment_status: string; fulfillment_status: string; currency_code: string; total: number; shipping_address?: Record<string, string>; items: Array<{ id: string; title: string; quantity: number; thumbnail?: string; detail?: { fulfilled_quantity?: number } }>; fulfillments?: Array<{ id: string; canceled_at?: string; shipped_at?: string; delivered_at?: string; items?: Array<{ line_item_id: string; quantity: number }> }> };

export function availableStock(item: MerchantInventory) {
  return item.location_levels.reduce((total, level) => total + Number(level.stocked_quantity) - Number(level.reserved_quantity), 0);
}
