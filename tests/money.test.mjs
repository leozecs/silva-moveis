import assert from "node:assert/strict";
import test from "node:test";
import { money } from "../src/lib/cart.ts";

test("Medusa v2 BRL amounts are formatted in major units", () => {
  assert.equal(money(50, "brl"), "R$ 50,00");
  assert.equal(money(9300, "brl"), "R$ 9.300,00");
});
