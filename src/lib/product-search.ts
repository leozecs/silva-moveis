export function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

export function matchesProductSearch(product: { title: string; subtitle?: string | null; description?: string | null }, query: string) {
  const text = normalizeSearch([product.title, product.subtitle, product.description].filter(Boolean).join(" "));
  return normalizeSearch(query).split(/\s+/).filter(Boolean).every((word) => text.includes(word));
}
