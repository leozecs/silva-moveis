import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const backend = "http://localhost:9010";
const frontend = "http://localhost:3001";
const key = process.env.SILVA_TEST_PUBLISHABLE_KEY;
if (!key) throw new Error("Set SILVA_TEST_PUBLISHABLE_KEY from the isolated seed output");
const headers = { "content-type": "application/json", "x-publishable-api-key": key };
async function native(path, { token, data, method = data ? "POST" : "GET", status = 200 } = {}) {
  const response = await fetch(backend + path, { method, headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
  const payload = await response.json();
  assert.equal(response.status, status, `${path}: ${JSON.stringify(payload)}`);
  return payload;
}
async function customer(label) {
  const email = `silva-test-${label}-${randomUUID()}@example.com`.toLowerCase();
  const password = randomUUID();
  const registration = await native("/auth/customer/emailpass/register", { data: { email, password } });
  await native("/store/customers", { token: registration.token, data: { email, first_name: "Teste", last_name: label } });
  const { token } = await native("/auth/customer/emailpass", { data: { email, password } });
  const response = await fetch(frontend + "/api/auth/login", { method: "POST", headers: { "content-type": "application/json", origin: frontend }, body: JSON.stringify({ email, password }) });
  assert.equal(response.status, 200, "BFF login");
  const cookie = response.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
  assert.ok(cookie.includes("medusa_customer_token="));
  return { token, cookie };
}
async function bff(path, actor, data, expected = 200, origin = frontend) {
  const response = await fetch(frontend + path, { method: data ? "POST" : "GET", headers: { "content-type": "application/json", origin, cookie: actor?.cookie ?? "" }, ...(data ? { body: JSON.stringify(data) } : {}) });
  const payload = await response.json();
  assert.equal(response.status, expected, `${path}: ${JSON.stringify(payload)}`);
  assert.match(response.headers.get("cache-control") ?? "", /no-store/);
  return payload;
}

const a = await customer("A"), b = await customer("B");
const { regions } = await native("/store/regions");
const region = regions.find(r => r.name === "Brasil teste");
assert.ok(region);
const { products } = await native(`/store/products?handle=produto-integracao&region_id=${region.id}&fields=variants.calculated_price,variants.inventory_quantity`);
const variant = products[0].variants[0];
assert.equal(variant.calculated_price.calculated_amount, 50.9, "Medusa currency is major units");
const { cart } = await bff("/api/cart", a, { action: "create" });
assert.ok(cart.customer_id);
await bff(`/api/cart?cart_id=${cart.id}`, b, undefined, 404);
await native(`/store/carts/${cart.id}`, { token: b.token, status: 404 });
await native(`/store/carts/${cart.id}`, { status: 401 });
await bff("/api/cart", a, { action: "add", cartId: cart.id, variant_id: variant.id, quantity: 1 }, 403, "https://attacker.example");
await bff("/api/cart", a, { action: "add", cartId: cart.id, variant_id: variant.id, quantity: 1.5 }, 400);
const added = await bff("/api/cart", a, { action: "add", cartId: cart.id, variant_id: variant.id, quantity: 1 });
assert.equal(added.cart.items[0].unit_price, 50.9);
await bff("/api/cart", a, { action: "update", cartId: cart.id, lineItemId: added.cart.items[0].id, quantity: 11 }, 400);
const address = { first_name: "Teste", last_name: "Cliente", phone: "11999999999", postal_code: "01001000", street: "Praça da Sé", number: "12", complement: "Sala 2", neighborhood: "Sé", city: "São Paulo", province: "SP" };
const saved = await bff("/api/cart", a, { action: "update_cart", cartId: cart.id, data: { shipping: address, same_billing_address: true, payment_method: "pix", terms_accepted: true } });
assert.equal(saved.cart.shipping_address.metadata.number, "12");
assert.equal(saved.cart.metadata.terms_acceptance.customer_id, cart.customer_id);
await bff("/api/account", a, { action: "save_address", address, is_default_shipping: true });
const { addresses } = await bff("/api/account?section=addresses", a);
assert.equal(addresses.length, 1);
assert.equal(addresses[0].metadata.neighborhood, "Sé");
await bff("/api/account", b, { action: "delete_address", id: addresses[0].id }, 404);
const updated = await bff("/api/account", a, { action: "profile", first_name: "Nome atualizado", last_name: "Cliente", phone: "11988888888" });
assert.equal(updated.customer.first_name, "Nome atualizado");
const orders = await bff("/api/account?section=orders", a);
assert.equal(orders.count, 0);
await bff("/api/cart", a, { action: "complete", cartId: cart.id }, 409);
await bff("/api/account", a, { action: "delete_address", id: addresses[0].id });
await bff("/api/cart", a, { action: "remove", cartId: cart.id, lineItemId: added.cart.items[0].id });
console.log("PASS: real Medusa + BFF, two-account isolation, CSRF, stock limits, address metadata, terms, profile, orders and cart deletion. No payment was created.");
