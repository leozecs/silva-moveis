#!/usr/bin/env python3
"""Compare storefront photos with embedded product photos extracted by pdfimages -j."""

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageOps


def thumbnail(path: Path) -> np.ndarray:
    with Image.open(path) as image:
        return np.asarray(image.convert("RGB").resize((32, 32)), dtype=np.float32)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("image_list", type=Path)
    parser.add_argument("extracted_prefix", type=Path)
    parser.add_argument("storefront_images", type=Path)
    parser.add_argument("--contact-sheets", type=Path)
    parser.add_argument("--contact-sheets-only", action="store_true")
    args = parser.parse_args()
    by_page: dict[int, list[Path]] = {}
    for line in args.image_list.read_text().splitlines()[2:]:
        columns = line.split()
        if len(columns) < 6 or columns[2] != "image":
            continue
        page, number, width, height = map(int, (columns[0], columns[1], columns[3], columns[4]))
        if width < 350 or height < 350 or (width == 966 and height == 1628):
            continue
        for ext in ("jpg", "png", "ppm", "pbm"):
            path = args.extracted_prefix.parent / f"{args.extracted_prefix.name}-{number:03}.{ext}"
            if path.is_file():
                by_page.setdefault(page, []).append(path)
                break
    results = []
    for number in ([] if args.contact_sheets_only else range(1, 96)):
        source = thumbnail(args.storefront_images / f"{number:02}.jpg")
        matches = [
            (float(np.abs(source - thumbnail(path)).mean()), path.name)
            for path in by_page.get(number + 3, [])
        ]
        if not matches:
            results.append({"sku": f"SM-{number:03}", "error": "no_pdf_photo"})
        else:
            score, image = min(matches)
            results.append({"sku": f"SM-{number:03}", "score": round(score, 2), "pdf_image": image})
    print(json.dumps({"count": len(results), "worst": sorted(results, key=lambda item: item.get("score", 999), reverse=True)[:20], "over_60": [item for item in results if item.get("score", 999) > 60]}, ensure_ascii=False, indent=2))
    if args.contact_sheets:
        args.contact_sheets.mkdir(parents=True, exist_ok=True)
        for start in range(1, 96, 10):
            sheet = Image.new("RGB", (1000, 1800), "white")
            draw = ImageDraw.Draw(sheet)
            for row, number in enumerate(range(start, min(start + 10, 96))):
                y = row * 180
                draw.text((5, y + 5), f"SM-{number:03} / Loja | PDF", fill="black")
                paths = [args.storefront_images / f"{number:02}.jpg", *by_page.get(number + 3, [])]
                for column, path in enumerate(paths[:6]):
                    with Image.open(path) as image:
                        preview = ImageOps.contain(image.convert("RGB"), (160, 150))
                        sheet.paste(preview, (column * 165, y + 25))
            sheet.save(args.contact_sheets / f"catalog-{start:02}.jpg", quality=90)


if __name__ == "__main__":
    main()
