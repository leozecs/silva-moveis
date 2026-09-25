import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const base = 'http://localhost:3001';
const browser = await chromium.launch({ headless: true });
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 } });
    const login = await context.request.post(base + '/api/auth/login', { headers: { Origin: base }, data: { email: 'merchant-test@example.com', password: 'isolated-local-test-only-2026' } });
    assert.equal(login.status(), 200);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/admin');
    await page.getByRole('heading', { name: 'Painel do lojista' }).waitFor();
    await page.getByRole('button', { name: 'Aceitar', exact: true }).click({ timeout: 2000 }).catch(() => {});
    await page.getByRole('heading', { name: 'Produto de integração (não comercial)', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Editar', exact: true }).first().click();
    await page.getByRole('dialog', { name: 'Editar produto' }).waitFor();
    await page.getByLabel('Nome do produto', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Fechar', exact: true }).first().click();
    for (const tab of ['Categorias', 'Estoque', 'Notificações', 'Pedidos']) {
      await page.getByRole('navigation', { name: 'Gestão da loja' }).getByRole('button', { name: tab, exact: true }).click();
      await page.getByText(/Atualizado às/).first().waitFor();
      assert.deepEqual(await page.locator('main [role="alert"]').allTextContents(), [], `${tab} must load without errors`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${tab}: no horizontal overflow`);
    }
    await page.goto(base + '/minha-conta');
    await page.waitForURL('**/admin');
    await page.getByRole('button', { name: 'Sair', exact: true }).click();
    await page.waitForURL('**/acesso');
    assert.deepEqual(errors, []);
    console.log(`PASS merchant ${mobile ? 'mobile' : 'desktop'}: tabs, product dialog, account redirect, logout, no overflow/errors.`);
    await context.close();
  }
} finally { await browser.close(); }
