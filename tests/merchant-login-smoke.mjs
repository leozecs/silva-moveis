import assert from 'node:assert/strict';
import { once } from 'node:events';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const base = 'http://localhost:3000';
const email = process.env.MEDUSA_ADMIN_EMAIL;
if (!email || !process.stdin.isTTY) throw new Error('Admin email and interactive terminal required.');
process.stdout.write('Administrator password (not echoed): ');
process.stdin.setRawMode(true);
process.stdin.resume();
let password = '';
while (true) {
  const [chunk] = await once(process.stdin, 'data');
  if (String(chunk).includes('\u0003')) process.exit(130);
  password += String(chunk);
  if (/[\r\n]/.test(String(chunk))) break;
}
process.stdin.setRawMode(false);
process.stdin.pause();
process.stdout.write('\n');
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext();
  const response = await context.request.post(base + '/api/auth/login', { headers: { Origin: base }, data: { email, password: password.trim() } });
  password = '';
  assert.equal(response.status(), 200, 'Admin login must succeed.');
  assert.equal((await response.json()).href, '/admin');
  const session = await context.request.get(base + '/api/auth/session');
  assert.equal((await session.json()).role, 'merchant');
  const page = await context.newPage();
  await page.goto(base + '/admin', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Painel do lojista', exact: true }).waitFor();
  const accountLink = page.locator('header').getByRole('link', { name: 'Minha Conta', exact: true });
  await accountLink.waitFor();
  assert.equal(await accountLink.getAttribute('href'), '/admin');
  assert.equal(await page.getByText('Indisponível', { exact: true }).count(), 0, 'Admin counters should use actual API results.');
  await page.goto(base + '/minha-conta', { waitUntil: 'domcontentloaded' });
  await page.waitForURL('**/admin');
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await page.waitForURL('**/acesso');
  const loggedOut = await context.request.get(base + '/api/auth/session');
  assert.equal((await loggedOut.json()).authenticated, false);
  console.log('PASS: real admin login, verified merchant identity, live counters, header destination, account redirect and logout.');
} finally { await browser.close(); }
