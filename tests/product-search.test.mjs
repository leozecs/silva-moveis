import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSearch, matchesProductSearch } from '../src/lib/product-search.ts';

test('busca ignora acentos, caixa e espaços e exige todas as palavras', () => {
  assert.equal(normalizeSearch('  SOFÁ  '), 'sofa');
  const product = { title: 'Sofá Itália', description: 'Corda náutica azul' };
  assert.ok(matchesProductSearch(product, 'SOFA azul'));
  assert.ok(matchesProductSearch(product, '  corda   nautica '));
  assert.equal(matchesProductSearch(product, 'sofa vermelho'), false);
});
