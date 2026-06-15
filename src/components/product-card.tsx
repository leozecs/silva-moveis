import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/lib/data";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="group overflow-hidden rounded-md border-border/80 bg-white p-0 shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/produto/${product.slug}`} className="block">
        <div className="image-shine relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute left-4 top-4">
            <Badge className="rounded-sm bg-white/92 text-foreground shadow-sm backdrop-blur">
              {product.category}
            </Badge>
          </div>
        </div>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-gold">
                {product.collection}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">
                {product.name}
              </h3>
            </div>
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-foreground transition group-hover:border-gold group-hover:text-gold">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {product.shortDescription}
          </p>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
            <span>
              <span className="block text-xs text-muted-foreground">A partir de</span>
              <span className="font-semibold">{product.priceLabel}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <ShoppingCart className="size-4" />
              Comprar
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
