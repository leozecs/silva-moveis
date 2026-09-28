#!/usr/bin/env python3
"""Compare numbered Silva catalog pages with a read-only Medusa export.

Input rows: SKU|title|handle|amount|thumbnail|description. Never writes to DB.
"""

import argparse
import json
import re
import unicodedata
from decimal import Decimal
from pathlib import Path

from pypdf import PdfReader


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFKD", value.lower())
    value = "".join(char for char in value if not unicodedata.combining(char))
    return " ".join(re.findall(r"[a-z0-9]+", value))


def money_values(text: str) -> set[Decimal]:
    values = set()
    for match in re.finditer(r"R\$\s*([\d.,]+)", text):
        raw = match.group(1).rstrip(".,")
        # The PDF has some malformed secondary prices. Ignore those, but
        # require each main Medusa price to match a valid amount on its page.
        if not re.fullmatch(r"\d{1,3}(?:\.\d{3})*(?:,\d{2})?", raw):
            continue
        values.add(Decimal(raw.replace(".", "").replace(",", ".")))
    return values


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("export", type=Path)
    parser.add_argument("images", type=Path)
    parser.add_argument("--price-scale", type=Decimal, default=Decimal(100))
    args = parser.parse_args()

    pages = PdfReader(args.pdf).pages
    rows = [line.split("|", 5) for line in args.export.read_text().splitlines()]
    report = {"pdf_product_pages": 95, "medusa_rows": len(rows), "issues": []}
    seen = set()
    for row in rows:
        if len(row) != 6:
            report["issues"].append({"sku": row[0], "type": "bad_export_row"})
            continue
        sku, title, handle, amount, thumbnail, description = row
        match = re.fullmatch(r"SM-(\d{3})", sku)
        if not match:
            report["issues"].append({"sku": sku, "type": "bad_sku"})
            continue
        number = int(match.group(1))
        seen.add(number)
        if not 1 <= number <= 95:
            report["issues"].append({"sku": sku, "type": "outside_catalog"})
            continue
        price_fragments = []
        def collect_price(text, _cm, _tm, _font, size):
            if "R$" in text and money_values(text):
                price_fragments.append((size, money_values(text)))
        page_text = pages[number + 2].extract_text(visitor_text=collect_price) or ""
        # Compare word sequence, not just a generic word such as "conjunto".
        if normalize(title) not in normalize(page_text):
            report["issues"].append({"sku": sku, "type": "title_mismatch", "title": title})
        medusa_amount = Decimal(amount)
        largest = max((size for size, _ in price_fragments), default=0)
        page_prices = set().union(*(values for size, values in price_fragments if size == largest))
        if medusa_amount / args.price_scale not in page_prices:
            report["issues"].append({
                "sku": sku, "type": "price_mismatch",
                "medusa_amount": str(medusa_amount),
                "pdf_prices": sorted(map(str, page_prices)),
            })
        image = args.images / f"{number:02}.jpg"
        if not image.is_file() or image.stat().st_size == 0:
            report["issues"].append({"sku": sku, "type": "image_missing"})
        if not thumbnail.endswith(f"/catalog-images/{number:02}.jpg"):
            report["issues"].append({"sku": sku, "type": "image_url_mismatch", "url": thumbnail})
    for number in sorted(set(range(1, 96)) - seen):
        report["issues"].append({"sku": f"SM-{number:03}", "type": "missing_product"})
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
