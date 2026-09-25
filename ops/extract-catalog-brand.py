"""Extract the original embedded brand asset without redrawing the logo."""
from pathlib import Path
import argparse
from pypdf import PdfReader

parser = argparse.ArgumentParser()
parser.add_argument("catalog", type=Path)
parser.add_argument("output", type=Path)
parser.add_argument("--image", default="Image18.jpg")
args = parser.parse_args()
reader = PdfReader(args.catalog)
image = next(item for item in reader.pages[0].images if item.name == args.image)
args.output.parent.mkdir(parents=True, exist_ok=True)
image.image.save(args.output, format="PNG")
print(f"Extracted embedded image: {image.image.size}, {args.output}")
