import test from "node:test";
import assert from "node:assert/strict";
import { assertSameOrigin, requireId, requireQuantity, readJsonObject } from "../src/lib/http-policy.ts";

test("mutações recusam origem ausente, forjada ou cross-site", () => {
  for (const origin of [null, "https://attacker.example"]) {
    assert.throws(() => assertSameOrigin(new Request("https://loja.example/api/cart", { headers: origin ? { origin } : {} })), { status: 403 });
  }
  assert.doesNotThrow(() => assertSameOrigin(new Request("https://loja.example/api/cart", { headers: { origin: "https://loja.example" } })));
});
test("proxy privado aceita só origem pública configurada", () => {
  const previous = process.env.SILVA_PUBLIC_ORIGIN;
  process.env.SILVA_PUBLIC_ORIGIN = "https://loja.example";
  try {
    const internal = "http://0.0.0.0:3000/api/auth/login";
    assert.doesNotThrow(() => assertSameOrigin(new Request(internal, { headers: { origin: "https://loja.example" } })));
    assert.throws(() => assertSameOrigin(new Request(internal, { headers: { origin: "https://attacker.example" } })), { status: 403 });
    assert.throws(() => assertSameOrigin(new Request(internal, { headers: { origin: "https://loja.example", "sec-fetch-site": "cross-site" } })), { status: 403 });
  } finally {
    if (previous === undefined) delete process.env.SILVA_PUBLIC_ORIGIN;
    else process.env.SILVA_PUBLIC_ORIGIN = previous;
  }
});
test("IDs e quantidades rejeitam injeção, frações, infinito e limites", () => {
  assert.equal(requireId("cart_01ABCDEF", "cart"), "cart_01ABCDEF");
  assert.throws(() => requireId("../customers/me", "cart"));
  for (const value of [0, -1, 0.5, Infinity, NaN, "2", 1000]) assert.throws(() => requireQuantity(value));
  assert.equal(requireQuantity(2), 2);
});
test("parser limita tamanho real e exige objeto JSON", async () => {
  const request = (body) => new Request("https://loja.example/api/cart", { method: "POST", headers: { "content-type": "application/json" }, body });
  assert.deepEqual(await readJsonObject(request('{"action":"create"}')), { action: "create" });
  await assert.rejects(readJsonObject(request("[]")), { status: 400 });
  await assert.rejects(readJsonObject(request(JSON.stringify({ data: "x".repeat(17000) }))), { status: 413 });
});
