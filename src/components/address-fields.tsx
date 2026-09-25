"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { BRAZIL_STATES, formatCep, normalizeCep, type AddressDraft } from "@/lib/checkout-contract";

export function AddressFields({ value, onChange, prefix, errors = {} }: {
  value: AddressDraft;
  onChange: (next: AddressDraft) => void;
  prefix: string;
  errors?: Partial<Record<keyof AddressDraft, string>>;
}) {
  const [lookup, setLookup] = useState("");
  const current = useRef(value);
  current.current = value;
  const change = useRef(onChange);
  change.current = onChange;
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);

  async function lookupCep(input: string) {
    abort.current?.abort();
    const postal_code = formatCep(input);
    change.current({ ...current.current, postal_code });
    const cep = normalizeCep(postal_code);
    if (cep.length !== 8) { setLookup(""); return; }
    const controller = new AbortController();
    abort.current = controller;
    setLookup("Consultando CEP...");
    try {
      const response = await fetch(`/api/cep/${cep}`, { signal: controller.signal });
      const result = await response.json();
      if (controller.signal.aborted || normalizeCep(current.current.postal_code) !== cep) return;
      if (!response.ok) { setLookup(result.message ?? "Preencha o endereço manualmente."); return; }
      change.current({ ...current.current, street: result.street, neighborhood: result.neighborhood, city: result.city, province: result.province });
      setLookup("Endereço encontrado. Confira os dados e informe o número.");
    } catch {
      if (!controller.signal.aborted) setLookup("Não foi possível consultar. Preencha o endereço manualmente.");
    }
  }

  const fields: Array<{ key: keyof AddressDraft; label: string; autoComplete: string; type?: string }> = [
    { key: "first_name", label: "Nome", autoComplete: "given-name" },
    { key: "last_name", label: "Sobrenome", autoComplete: "family-name" },
    { key: "phone", label: "Telefone com DDD", autoComplete: "tel", type: "tel" },
    { key: "postal_code", label: "CEP", autoComplete: "postal-code" },
    { key: "street", label: "Rua ou avenida", autoComplete: "address-line1" },
    { key: "number", label: "Número (ou S/N)", autoComplete: "off" },
    { key: "complement", label: "Complemento (opcional)", autoComplete: "address-line2" },
    { key: "neighborhood", label: "Bairro", autoComplete: "address-level3" },
    { key: "city", label: "Cidade", autoComplete: "address-level2" },
  ];
  return <div className="grid gap-4 sm:grid-cols-2">
    {fields.map(({ key, label, autoComplete, type }) => <div key={key} className="grid gap-2">
      <label htmlFor={`${prefix}-${key}`} className="text-sm font-medium">{label}</label>
      <Input id={`${prefix}-${key}`} name={`${prefix}.${key}`} type={type ?? "text"}
        autoComplete={`section-${prefix} ${autoComplete}`} required={key !== "complement"}
        maxLength={key === "postal_code" ? 9 : 200} inputMode={key === "postal_code" ? "numeric" : undefined}
        value={value[key]} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `${prefix}-${key}-error` : undefined}
        onChange={(event) => key === "postal_code" ? void lookupCep(event.target.value) : onChange({ ...value, [key]: event.target.value })} />
      {errors[key] ? <p id={`${prefix}-${key}-error`} className="text-sm text-destructive">{errors[key]}</p> : null}
      {key === "postal_code" && lookup ? <p role="status" className="text-xs text-muted-foreground">{lookup}</p> : null}
    </div>)}
    <div className="grid gap-2"><label htmlFor={`${prefix}-province`} className="text-sm font-medium">Estado</label>
      <select id={`${prefix}-province`} name={`${prefix}.province`} required value={value.province} autoComplete={`section-${prefix} address-level1`}
        aria-invalid={Boolean(errors.province)} onChange={(e) => onChange({ ...value, province: e.target.value })}
        className="h-9 rounded-lg border border-input bg-background px-2 text-sm">
        <option value="">Selecione</option>{BRAZIL_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
      </select>{errors.province ? <p className="text-sm text-destructive">{errors.province}</p> : null}
    </div>
  </div>;
}
