export type StorefrontVariant = {
  id: string;
  title?: string;
  manage_inventory?: boolean;
  allow_backorder?: boolean;
  inventory_quantity?: number | null;
  metadata?: Record<string, unknown> | null;
  images?: Array<{ id: string; url: string }>;
  options?: Array<{ value: string; option_id: string; option?: { title?: string }; metadata?: Record<string, unknown> | null }>;
  calculated_price?: {
    calculated_amount: number;
    currency_code: string;
  } | null;
};

export type StorefrontProduct = {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  subtitle?: string | null;
  thumbnail?: string | null;
  images?: Array<{ id: string; url: string }>;
  variants?: StorefrontVariant[];
  options?: Array<{ id: string; title: string }>;
  collection?: { id: string; title: string; handle: string } | null;
  categories?: Array<{ id: string; name: string; handle: string; metadata?: Record<string, unknown> | null }>;
};

export type StorefrontCategory = {
  id: string;
  name: string;
  handle: string;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type StorefrontCustomer = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
};

type ProductsResponse = { products?: StorefrontProduct[]; count?: number };
type CategoriesResponse = { product_categories?: StorefrontCategory[] };

const backendUrl = (
  process.env.MEDUSA_BACKEND_URL ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
)?.replace(/\/$/, "");
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
const regionId = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID;

async function storefrontFetch<T>(path: string): Promise<T | null> {
  if (!backendUrl) return null;

  const headers = new Headers();
  if (publishableKey) headers.set("x-publishable-api-key", publishableKey);

  try {
    const response = await fetch(`${backendUrl}${path}`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

const productFields = [
  "id",
  "title",
  "handle",
  "description",
  "subtitle",
  "thumbnail",
  "*images",
  "variants",
  "variants.calculated_price",
  "variants.manage_inventory",
  "variants.allow_backorder",
  "variants.inventory_quantity",
  "variants.metadata",
  "*variants.options",
  "*variants.images",
  "*options",
  "collection",
  "*categories",
].join(",");

export async function getStorefrontProducts(options?: {
  query?: string;
  categoryId?: string;
  limit?: number;
}) {
  const params = new URLSearchParams({ limit: String(options?.limit ?? 100), fields: productFields });
  if (regionId) params.set("region_id", regionId);
  if (options?.query) params.set("q", options.query);
  if (options?.categoryId) params.set("category_id", options.categoryId);

  const products: StorefrontProduct[] = [];
  for (let offset = 0; ; offset += 100) {
    params.set("offset", String(offset));
    const payload = await storefrontFetch<ProductsResponse>(`/store/products?${params.toString()}`);
    if (!payload?.products) return [];
    products.push(...payload.products);
    if (options?.limit || payload.products.length < 100 || products.length >= (payload.count ?? Infinity)) break;
  }
  return products;
}

export async function getStorefrontProduct(handle: string) {
  const params = new URLSearchParams({
    handle,
    limit: "1",
    fields: productFields,
  });
  if (regionId) params.set("region_id", regionId);
  const payload = await storefrontFetch<ProductsResponse>(
    `/store/products?${params.toString()}`
  );
  return payload?.products?.[0] ?? null;
}

export async function getStorefrontCategories() {
  const payload = await storefrontFetch<CategoriesResponse>(
    "/store/product-categories?limit=100"
  );
  const categories = payload?.product_categories ?? [];
  const storefrontCategories = categories.filter((category) => category.metadata?.storefront_filter === true);
  return storefrontCategories.length ? storefrontCategories : categories;
}

export function getProductImage(product: StorefrontProduct) {
  return storefrontImageUrl(product.thumbnail ?? product.images?.[0]?.url ?? null);
}

export function storefrontImageUrl(url: string | null) {
  if (!url) return null;
  // These exact catalog assets are versioned with the storefront. Avoid the
  // retired Vercel hostname while preserving other merchant-provided URLs.
  const legacy = /^https:\/\/silva-moveis\.vercel\.app(\/catalog-images\/\d{2}\.jpg)$/.exec(url);
  return legacy ? legacy[1] : url;
}

export function getProductPrice(product: StorefrontProduct) {
  const price = product.variants?.[0]?.calculated_price;
  if (!price) return null;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: price.currency_code.toUpperCase(),
  }).format(price.calculated_amount / 100);
}

export async function getStorefrontCustomer(token: string) {
  if (!backendUrl) return null;

  const headers = new Headers({ Authorization: `Bearer ${token}` });
  if (publishableKey) headers.set("x-publishable-api-key", publishableKey);

  try {
    const response = await fetch(`${backendUrl}/store/customers/me`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as { customer?: StorefrontCustomer };
    return payload.customer ?? null;
  } catch {
    return null;
  }
}
