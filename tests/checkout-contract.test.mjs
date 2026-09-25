import test from "node:test";
import assert from "node:assert/strict";
import { emptyAddress, formatCep, normalizeCep, validateAddress, validateCheckout, fromMedusaAddress, toMedusaAddress } from "../src/lib/checkout-contract.ts";

const address = { ...emptyAddress, first_name: "Maria", last_name: "Silva", phone: "(11) 99999-9999", postal_code: "01001-000", street: "Praça da Sé", number: "12", complement: "Sala 2", neighborhood: "Sé", city: "São Paulo", province: "SP" };
test("endereço brasileiro é preservado entre formulário e Medusa", () => {
  assert.deepEqual(validateAddress(address), {});
  const stored = toMedusaAddress(address);
  assert.equal(stored.address_1, "Praça da Sé, 12");
  assert.equal(stored.country_code, "br");
  assert.equal(stored.province, "sp");
  assert.deepEqual(fromMedusaAddress(stored), { ...address, phone: "11999999999" });
});
test("CEP colado com pontuação é normalizado sem perder zeros", () => {
  assert.equal(formatCep("01001000"), "01001-000");
  assert.equal(normalizeCep("01001-000"), "01001000");
});
test("número, bairro, UF, CEP e telefone são obrigatórios", () => {
  const errors = validateAddress({ ...address, number: " ", neighborhood: "", province: "XX", postal_code: "123", phone: "9999" });
  for (const key of ["number", "neighborhood", "province", "postal_code", "phone"]) assert.ok(errors[key]);
});
test("revisão exige aceite explícito e método permitido", () => {
  const draft = { email: "maria@example.com", shipping: address, billing: { ...emptyAddress }, same_billing_address: true, payment_method: "pix", terms_accepted: true };
  assert.deepEqual(validateCheckout(draft), {});
  assert.ok(validateCheckout({ ...draft, terms_accepted: false }).terms_accepted);
  assert.ok(validateCheckout({ ...draft, payment_method: "cash" }).payment_method);
  assert.ok(validateCheckout({ ...draft, same_billing_address: false })["billing.number"]);
});
