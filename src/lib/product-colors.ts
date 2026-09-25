type ColorVariant = {
  metadata?: Record<string, unknown> | null;
  options?: Array<{ value: string; option_id: string; option?: { title?: string }; metadata?: Record<string, unknown> | null }>;
};

/** Only use colors and swatch values explicitly registered for this product. */
export function getVariantColor(variant: ColorVariant, options: Array<{ id: string; title: string }> = []) {
  const option = variant.options?.find((item) => {
    const title = item.option?.title ?? options.find((parent) => parent.id === item.option_id)?.title;
    return /^(cor|color|colour)$/i.test(title?.trim() ?? "");
  });
  if (!option?.value.trim()) return null;
  const raw = option.metadata?.hex ?? variant.metadata?.color_hex;
  const hex = typeof raw === "string" && /^#[0-9a-f]{6}$/i.test(raw) ? raw : null;
  return { name: option.value.trim(), hex };
}
