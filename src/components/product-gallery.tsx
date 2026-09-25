"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProductSelection } from "@/components/product-selection";

type ProductGalleryProps = { images: string[]; name: string; variantImages?: Record<string, string[]> };

export function ProductGallery({ images: fallbackImages, name, variantImages = {} }: ProductGalleryProps) {
  const selection = useProductSelection();
  const matching = selection ? variantImages[selection.selected] : undefined;
  const images = matching?.length ? matching : fallbackImages;
  return <Gallery key={selection?.selected ?? "default"} images={images} name={name} />;
}

function Gallery({ images, name }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0] ?? "");
  const dialog = useRef<HTMLDialogElement>(null);
  const displayed = images.includes(activeImage) ? activeImage : images[0];

  if (!images.length) return <div className="grid aspect-[4/3] place-items-center rounded-md bg-muted text-sm text-muted-foreground">Imagens não cadastradas</div>;

  return (
    <div className="grid gap-4">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
        <Image src={displayed} alt={name} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-contain" unoptimized priority />
        <div className="absolute bottom-5 right-5 flex gap-2">
          <Button onClick={() => dialog.current?.showModal()} variant="secondary" size="icon-lg" className="rounded-full bg-white/90 shadow-lg backdrop-blur" aria-label="Ampliar imagem"><Maximize2 className="size-4" /></Button>
        </div>
      </div>
      {images.length > 1 ? <div className="grid grid-cols-3 gap-3">{images.map((image, index) => <button key={image} onClick={() => setActiveImage(image)} className={cn("relative aspect-[4/3] overflow-hidden rounded-md border bg-muted transition", displayed === image ? "border-gold ring-2 ring-gold/20" : "border-border hover:border-gold/70")} aria-pressed={displayed === image} aria-label={`Ver imagem ${index + 1} de ${name}`}><Image src={image} alt={`${name} imagem ${index + 1}`} fill sizes="160px" className="object-contain" unoptimized /></button>)}</div> : null}
      <dialog ref={dialog} aria-label={`Imagem ampliada de ${name}`} className="fixed inset-0 m-auto w-[min(95vw,1100px)] rounded-xl bg-white p-4 backdrop:bg-black/70"><div className="flex justify-end"><Button variant="ghost" size="icon" onClick={() => dialog.current?.close()} aria-label="Fechar imagem ampliada"><X className="size-5" /></Button></div><div className="relative h-[75dvh]"><Image src={displayed} alt={name} fill sizes="95vw" className="object-contain" unoptimized /></div></dialog>
    </div>
  );
}
