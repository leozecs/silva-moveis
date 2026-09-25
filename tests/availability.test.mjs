import test from "node:test";
import assert from "node:assert/strict";
import { availability } from "../src/lib/availability.ts";

test("estoque desconhecido não é anunciado como disponível", () => {
  assert.equal(availability({ manage_inventory: true }).purchasable, false);
  assert.equal(availability({ manage_inventory: true, inventory_quantity: 0 }).schema, "OutOfStock");
  assert.equal(availability({ manage_inventory: true, inventory_quantity: 1 }).purchasable, true);
});
test("somente configuração explícita habilita encomenda ou estoque não gerenciado", () => {
  assert.equal(availability({ allow_backorder: true, inventory_quantity: 0 }).schema, "BackOrder");
  assert.equal(availability({ manage_inventory: false }).purchasable, true);
  assert.equal(availability().purchasable, false);
});
