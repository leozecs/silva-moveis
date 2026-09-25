import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

// Fixed local targets and a disposable account: never run against production.
const base = 'http://localhost:3001';
const backend = 'http://localhost:9010';
let cookie = '';
async function call(path, data, expected = 200, origin = base) {
  const response = await fetch(base + path, { method: data ? 'POST' : 'GET', headers: { Origin: origin, Cookie: cookie, 'Content-Type': 'application/json' }, ...(data ? { body: JSON.stringify(data) } : {}) });
  const payload = await response.json();
  assert.equal(response.status, expected, `${path}: ${JSON.stringify(payload)}`);
  return { payload, response };
}
await call('/api/merchant?resource=products', undefined, 403);
const login = await call('/api/auth/login', { email: 'merchant-test@example.com', password: 'isolated-local-test-only-2026' });
cookie = login.response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
assert.equal(login.payload.href, '/admin');
await call('/api/merchant', { action: 'save_category', name: 'Forbidden' }, 403, 'https://attacker.example');
const { payload: settings } = await call('/api/merchant?resource=settings');
assert.equal(settings.pricesVerified, true, 'Only the isolated test environment enables price writes.');
const channel = settings.channels.sales_channels.find(item => item.name === 'Silva integração isolada');
const location = settings.locations.stock_locations.find(item => item.name === 'Estoque isolado');
assert.ok(channel && location);
const suffix = randomUUID();
let product, category;
try {
  category = (await call('/api/merchant', { action: 'save_category', name: `Teste ${suffix}` })).payload.product_category;
  await call('/api/merchant', { action: 'save_category', id: category.id, name: `Categoria ${suffix}` });
  product = (await call('/api/merchant', { action: 'save_product', title: `Produto ${suffix}`, description: 'Teste isolado', category_ids: [category.id], images: [], sku: suffix, price: 125.90, sales_channel_id: channel.id, shipping_profile_id: settings.profiles.shipping_profiles[0].id })).payload.product;
  const read = (await call(`/api/merchant?resource=product&id=${product.id}`)).payload.product;
  assert.equal(read.categories[0].id, category.id);
  assert.equal(read.variants[0].prices.find(p => p.currency_code === 'brl').amount, 125.9);
  await call('/api/merchant', { action: 'delete_category', id: category.id }, 409);
  const updated = (await call('/api/merchant', { action: 'save_product', id: read.id, updated_at: read.updated_at, title: `${read.title} editado`, description: 'Atualizado', category_ids: [category.id], images: [] })).payload.product;
  await call('/api/merchant', { action: 'product_status', id: updated.id, updated_at: read.updated_at, status: 'published' }, 409);
  await call('/api/merchant', { action: 'save_variant', product_id: updated.id, id: updated.variants[0].id, title: 'Padrão', sku: suffix, options: { Modelo: 'Padrão' }, price: 130.50, color_hex: '#aabbcc' });
  const inventory = (await call('/api/merchant?resource=inventory')).payload.inventory_items.find(item => item.sku === suffix);
  assert.ok(inventory);
  await call('/api/merchant', { action: 'set_stock', id: inventory.id, location_id: location.id, quantity: 10, previous_quantity: null });
  const savedInventory = (await call('/api/merchant?resource=inventory')).payload.inventory_items.find(item => item.id === inventory.id);
  assert.equal(savedInventory.location_levels.find(item => item.location_id === location.id).stocked_quantity, 10);
  await call('/api/merchant', { action: 'set_stock', id: inventory.id, location_id: location.id, quantity: 9, previous_quantity: 1 }, 409);
  product = (await call(`/api/merchant?resource=product&id=${product.id}`)).payload.product;
  product = (await call('/api/merchant', { action: 'product_status', id: product.id, updated_at: product.updated_at, status: 'published' })).payload.product;
  assert.equal(product.status, 'published');
  await call('/api/merchant', { action: 'delete_product', id: product.id, confirmation: product.title }, 409);
  await call('/api/merchant?resource=notifications');
  await call('/api/merchant?resource=orders&period=week');
  // A customer cookie must not authorize merchant APIs, even when valid.
  const auth = await fetch(backend + '/auth/customer/emailpass/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `customer-${suffix}@example.com`, password: randomUUID() }) });
  assert.equal(auth.status, 200);
  const customerToken = (await auth.json()).token;
  const adminCookie = cookie;
  cookie = `medusa_merchant_token=${customerToken}`;
  await call('/api/merchant?resource=products', undefined, 403);
  cookie = adminCookie;
  console.log('PASS: native merchant identity, CSRF, category CRUD, product CRUD, BRL major units, variants, stock, stale writes, publishing, customer isolation.');
} finally {
  if (product) {
    const current = (await call(`/api/merchant?resource=product&id=${product.id}`)).payload.product;
    if (current.status !== 'draft') await call('/api/merchant', { action: 'product_status', id: current.id, updated_at: current.updated_at, status: 'draft' });
    await call('/api/merchant', { action: 'delete_product', id: current.id, confirmation: current.title });
  }
  if (category) await call('/api/merchant', { action: 'delete_category', id: category.id });
}
