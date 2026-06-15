"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  name: string;
};

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="grid gap-4">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
        <Image
          src={activeImage}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute left-5 top-5 flex gap-2">
          <Badge className="rounded-sm bg-white/90 text-foreground backdrop-blur">
            Galeria premium
          </Badge>
          <Badge className="rounded-sm bg-graphite/90 text-white backdrop-blur">
            Zoom visual
          </Badge>
        </div>
        <div className="absolute bottom-5 right-5 flex gap-2">
          <Button
            variant="secondary"
            size="icon-lg"
            className="rounded-full bg-white/90 shadow-lg backdrop-blur"
            aria-label="Simular zoom"
          >
            <Search className="size-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon-lg"
            className="rounded-full bg-white/90 shadow-lg backdrop-blur"
            aria-label="Ampliar imagem"
          >
            <Maximize2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {images.map((image, index) => (
          <button
            key={image}
            onClick={() => setActiveImage(image)}
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-md border bg-muted transition",
              activeImage === image
                ? "border-gold ring-2 ring-gold/20"
                : "border-border hover:border-gold/70"
            )}
            aria-label={`Ver imagem ${index + 1} de ${name}`}
          >
            <Image
              src={image}
              alt={`${name} imagem ${index + 1}`}
              fill
              sizes="180px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
