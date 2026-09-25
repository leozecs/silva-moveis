import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getVariantColor } from '../src/lib/product-colors.ts';

test('does not invent colors from a model or variant name', () => {
  assert.equal(getVariantColor({ options: [{ option_id: 'model', value: 'Azul' }] }, [{ id: 'model', title: 'Modelo' }]), null);
});
test('uses only registered color and validated hex', () => {
  const variant = { options: [{ option_id: 'cor', value: 'Azul' }], metadata: { color_hex: '#123abc' } };
  assert.deepEqual(getVariantColor(variant, [{ id: 'cor', title: 'Cor' }]), { name: 'Azul', hex: '#123abc' });
  variant.metadata.color_hex = 'url(https://example.com)';
  assert.deepEqual(getVariantColor(variant, [{ id: 'cor', title: 'Cor' }]), { name: 'Azul', hex: null });
});
