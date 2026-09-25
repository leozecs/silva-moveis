import { getProductImage, getProductPrice, getStorefrontProducts } from "@/lib/medusa";
import { matchesProductSearch } from "@/lib/product-search";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query || query.length > 100) return Response.json({ products: [], hasMore: false });
  const products = (await getStorefrontProducts()).filter((product) => matchesProductSearch(product, query));
  return Response.json({ products: products.slice(0, 5).map((product) => ({ id: product.id, title: product.title, href: `/produto/${product.handle}`, image: getProductImage(product), price: getProductPrice(product) })), hasMore: products.length > 5 }, { headers: { "Cache-Control": "no-store" } });
}
