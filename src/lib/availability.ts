export type InventoryVariant = {
  manage_inventory?: boolean;
  allow_backorder?: boolean;
  inventory_quantity?: number | null;
};
export function availability(variant?: InventoryVariant) {
  if (!variant) return { purchasable: false, label: "Selecione uma opção", schema: "OutOfStock" };
  if (variant.manage_inventory === false) return { purchasable: true, label: "Disponível", schema: "InStock" };
  if (typeof variant.inventory_quantity === "number" && variant.inventory_quantity > 0) {
    return { purchasable: true, label: "Disponível em estoque", schema: "InStock" };
  }
  if (variant.allow_backorder === true) return { purchasable: true, label: "Disponível sob encomenda", schema: "BackOrder" };
  if (variant.inventory_quantity === 0) return { purchasable: false, label: "Esgotado", schema: "OutOfStock" };
  return { purchasable: false, label: "Disponibilidade temporariamente indisponível", schema: "OutOfStock" };
}
