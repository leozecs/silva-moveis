export const TERMS_VERSION = "2026-09-23";
export const PAYMENT_METHODS = ["credit_card", "pix", "boleto"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export const BRAZIL_STATES = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"] as const;

export type AddressDraft = {
  first_name: string;
  last_name: string;
  phone: string;
  postal_code: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  province: string;
};

export const emptyAddress: AddressDraft = {
  first_name: "", last_name: "", phone: "", postal_code: "", street: "", number: "",
  complement: "", neighborhood: "", city: "", province: "",
};

export type CheckoutDraft = {
  email: string;
  shipping: AddressDraft;
  billing: AddressDraft;
  same_billing_address: boolean;
  payment_method: PaymentMethod | "";
  terms_accepted: boolean;
};

export type MedusaAddress = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country_code?: string;
  metadata?: Record<string, unknown> | null;
};

export function normalizeCep(value: string) { return value.replace(/\D/g, ""); }
export function formatCep(value: string) {
  return normalizeCep(value).slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
}

export function validateAddress(address: AddressDraft): Partial<Record<keyof AddressDraft, string>> {
  const errors: Partial<Record<keyof AddressDraft, string>> = {};
  const required: Array<keyof AddressDraft> = ["first_name", "last_name", "street", "number", "neighborhood", "city"];
  for (const key of required) if (!address[key]?.trim()) errors[key] = "Preencha este campo.";
  for (const key of Object.keys(emptyAddress) as Array<keyof AddressDraft>) {
    if (typeof address[key] !== "string" || address[key].length > 200) errors[key] = "Valor inválido ou muito longo.";
  }
  if (!/^\d{8}$/.test(normalizeCep(address.postal_code ?? ""))) errors.postal_code = "Informe um CEP com 8 dígitos.";
  if (!(BRAZIL_STATES as readonly string[]).includes(address.province?.toUpperCase())) errors.province = "Selecione um estado válido.";
  if (!/^\d{10,11}$/.test((address.phone ?? "").replace(/\D/g, ""))) errors.phone = "Informe telefone com DDD.";
  return errors;
}

export function validateCheckout(draft: CheckoutDraft) {
  const errors: Record<string, string> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email) || draft.email.length > 254) errors.email = "Informe um e-mail válido.";
  for (const [key, value] of Object.entries(validateAddress(draft.shipping))) errors[`shipping.${key}`] = value;
  if (!draft.same_billing_address) {
    for (const [key, value] of Object.entries(validateAddress(draft.billing))) errors[`billing.${key}`] = value;
  }
  if (!(PAYMENT_METHODS as readonly string[]).includes(draft.payment_method)) errors.payment_method = "Selecione uma forma de pagamento.";
  if (draft.terms_accepted !== true) errors.terms_accepted = "Leia e aceite os termos para continuar.";
  return errors;
}

// Street remains human-readable in the native address. Separate number and
// neighborhood are versioned metadata, shared by checkout/account/fulfillment.
export function toMedusaAddress(address: AddressDraft): MedusaAddress {
  return {
    first_name: address.first_name.trim(), last_name: address.last_name.trim(),
    phone: address.phone.replace(/\D/g, ""), postal_code: normalizeCep(address.postal_code),
    address_1: `${address.street.trim()}, ${address.number.trim()}`,
    address_2: address.complement.trim(), city: address.city.trim(),
    province: address.province.toLowerCase(), country_code: "br",
    metadata: { address_schema: 1, street: address.street.trim(), number: address.number.trim(), neighborhood: address.neighborhood.trim() },
  };
}

export function fromMedusaAddress(address?: MedusaAddress | null): AddressDraft {
  if (!address) return { ...emptyAddress };
  const string = (value: unknown) => typeof value === "string" ? value : "";
  return {
    first_name: address.first_name ?? "", last_name: address.last_name ?? "", phone: address.phone ?? "",
    postal_code: formatCep(address.postal_code ?? ""),
    street: string(address.metadata?.street) || address.address_1 || "",
    number: string(address.metadata?.number), complement: address.address_2 ?? "",
    neighborhood: string(address.metadata?.neighborhood), city: address.city ?? "", province: (address.province ?? "").toUpperCase(),
  };
}
