export type StorefrontVariant = {
  id: string;
  title?: string;
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
  collection?: { id: string; title: string; handle: string } | null;
  categories?: Array<{ id: string; name: string; handle: string }>;
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

type ProductsResponse = { products?: StorefrontProduct[] };
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
  "images",
  "variants",
  "collection",
  "categories",
].join(",");

export async function getStorefrontProducts(options?: {
  query?: string;
  categoryId?: string;
}) {
  const params = new URLSearchParams({ limit: "24", fields: productFields });
  if (regionId) params.set("region_id", regionId);
  if (options?.query) params.set("q", options.query);
  if (options?.categoryId) params.set("category_id", options.categoryId);

  const payload = await storefrontFetch<ProductsResponse>(
    `/store/products?${params.toString()}`
  );
  return payload?.products ?? [];
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
  return payload?.product_categories ?? [];
}

export function getProductImage(product: StorefrontProduct) {
  return product.thumbnail ?? product.images?.[0]?.url ?? null;
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
