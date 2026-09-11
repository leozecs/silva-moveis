import Link from "next/link";
import { ArrowUpRight, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getProductImage, getProductPrice, type StorefrontProduct } from "@/lib/medusa";

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const image = getProductImage(product);
  const category = product.categories?.[0]?.name ?? product.collection?.title;
  const price = getProductPrice(product);

  return (
    <Card className="group overflow-hidden rounded-md border-border/80 bg-white p-0 shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/produto/${product.handle}`} className="block">
        <div className="image-shine relative aspect-[4/3] overflow-hidden bg-muted">
          {image ? (
            <img src={image} alt={product.title} className="size-full object-cover transition duration-700 group-hover:scale-105" />
          ) : (
            <div className="grid size-full place-items-center text-sm text-muted-foreground">Imagem não cadastrada</div>
          )}
          {category ? (
            <div className="absolute left-4 top-4">
              <Badge className="rounded-sm bg-white/92 text-foreground shadow-sm backdrop-blur">{category}</Badge>
            </div>
          ) : null}
        </div>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              {product.collection?.title ? <p className="text-xs uppercase tracking-[0.22em] text-gold">{product.collection.title}</p> : null}
              <h3 className="mt-2 text-xl font-semibold tracking-tight">{product.title}</h3>
            </div>
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-foreground transition group-hover:border-gold group-hover:text-gold"><ArrowUpRight className="size-4" /></span>
          </div>
          {product.subtitle || product.description ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{product.subtitle ?? product.description}</p> : null}
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
            <span><span className="block text-xs text-muted-foreground">Preço</span><span className="font-semibold">{price ?? "Preço não informado"}</span></span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground"><ShoppingCart className="size-4" />Ver produto</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
