// Uses authenticated Medusa Admin APIs. Defaults to a read-only plan.
import { once } from 'node:events';

const base = (process.env.MEDUSA_BACKEND_URL ?? '').replace(/\/$/, '');
const email = process.env.MEDUSA_ADMIN_EMAIL;
if (!base || !email) throw new Error('MEDUSA_BACKEND_URL and MEDUSA_ADMIN_EMAIL are required.');
let token = process.env.MEDUSA_ADMIN_TOKEN;
if (!token) {
  process.stdout.write('Medusa administrator password (not echoed): ');
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  process.stdin.resume();
  let password = '';
  while (true) {
    const [chunk] = await once(process.stdin, 'data');
    const value = String(chunk);
    if (value.includes('\u0003')) process.exit(130);
    password += value;
    if (/[\r\n]/.test(value)) break;
  }
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
  process.stdin.pause();
  process.stdout.write('\n');
  const response = await fetch(`${base}/auth/user/emailpass`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: password.trim() }) });
  const data = await response.json();
  if (!response.ok || !data.token) throw new Error(`Admin authentication failed (${response.status}).`);
  token = data.token;
  password = '';
}
async function request(path, body) {
  const response = await fetch(`${base}${path}`, { method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Medusa ${response.status} at ${path}`);
  return response.json();
}
const { products, count } = await request('/admin/products?limit=100&fields=id,title,*categories,variants.sku');
if (count > 100) throw new Error('Catalog exceeds this reviewed batch; paginate before applying.');
const { product_categories: categories } = await request('/admin/product-categories?limit=100');
function categoryFor(title) {
  const text = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (text.includes('suporte')) return 'Suportes para balanços';
  if (text.includes('pet')) return 'Móveis para pets';
  if (text.includes('balanco')) return 'Balanços';
  if (text.includes('espreguicadeira')) return 'Espreguiçadeiras';
  if (text.includes('ombrelone')) return 'Ombrelones';
  if (text.includes('pergolado')) return 'Pergolados';
  if (text.includes('aparador')) return 'Aparadores';
  if (text.includes('mesa') || text.includes('bistro')) return 'Mesas e conjuntos de jantar';
  if (text.includes('banqueta')) return 'Banquetas';
  if (text.includes('cadeira')) return 'Cadeiras';
  if (text.includes('poltrona')) return 'Poltronas';
  if (text.includes('chaise') || text.includes('concha')) return 'Chaises e conchas';
  if (text.includes('puff')) return 'Puffs';
  if (text.includes('rede')) return 'Redes de descanso';
  if (text.includes('cesto')) return 'Cestos';
  if (text.includes('sofa')) return 'Sofás e conjuntos';
  if (text.includes('conjunto')) return 'Conjuntos de estar';
  throw new Error(`Unclassified product: ${title}`);
}
const plan = products.filter((p) => p.variants?.some((v) => /^SM-\d{3}$/.test(v.sku))).map((product) => ({ product, name: categoryFor(product.title) }));
console.log(JSON.stringify({ apply: process.argv.includes('--apply'), productCount: plan.length, categories: Object.fromEntries([...new Set(plan.map((p) => p.name))].map((name) => [name, plan.filter((p) => p.name === name).length])) }, null, 2));
if (!process.argv.includes('--apply')) process.exit(0);
for (const { product, name } of plan) {
  let category = categories.find((c) => c.name === name);
  if (!category) {
    const handle = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const result = await request('/admin/product-categories', { name, handle, is_active: true, is_internal: false, metadata: { storefront_filter: true } });
    category = result.product_category;
    categories.push(category);
  }
  if (product.categories?.some((c) => c.id === category.id)) continue;
  await request(`/admin/products/${product.id}`, { categories: [...(product.categories ?? []).map((c) => ({ id: c.id })), { id: category.id }] });
  console.log(`Linked ${product.title}: ${name}`);
}
console.log('Category sync complete. Existing categories, prices and stock preserved.');
