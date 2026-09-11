"use client";

import { useState } from "react";
import { Maximize2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductGalleryProps = { images: string[]; name: string };

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0] ?? "");

  if (!images.length) return <div className="grid aspect-[4/3] place-items-center rounded-md bg-muted text-sm text-muted-foreground">Imagens não cadastradas</div>;

  return (
    <div className="grid gap-4">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
        <img src={activeImage} alt={name} className="size-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute bottom-5 right-5 flex gap-2">
          <Button variant="secondary" size="icon-lg" className="rounded-full bg-white/90 shadow-lg backdrop-blur" aria-label="Visualizar imagem"><Search className="size-4" /></Button>
          <Button variant="secondary" size="icon-lg" className="rounded-full bg-white/90 shadow-lg backdrop-blur" aria-label="Ampliar imagem"><Maximize2 className="size-4" /></Button>
        </div>
      </div>
      {images.length > 1 ? <div className="grid grid-cols-3 gap-3">{images.map((image, index) => <button key={image} onClick={() => setActiveImage(image)} className={cn("relative aspect-[4/3] overflow-hidden rounded-md border bg-muted transition", activeImage === image ? "border-gold ring-2 ring-gold/20" : "border-border hover:border-gold/70")} aria-label={`Ver imagem ${index + 1} de ${name}`}><img src={image} alt={`${name} imagem ${index + 1}`} className="size-full object-cover" /></button>)}</div> : null}
    </div>
  );
}
