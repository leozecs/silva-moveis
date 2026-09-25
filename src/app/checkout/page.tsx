"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Landmark, ScanLine } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { AddressFields } from "@/components/address-fields";
import { money, type StoreCart } from "@/lib/cart";
import { fromMedusaAddress, validateAddress, PAYMENT_METHODS, type AddressDraft, type PaymentMethod } from "@/lib/checkout-contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const methods = [
  { id: "credit_card", label: "Cartão de crédito", icon: CreditCard },
  { id: "pix", label: "Pix", icon: Landmark },
  { id: "boleto", label: "Boleto", icon: ScanLine },
] as const;

export default function CheckoutPage() {
  const { cart, isLoading, error, refreshCart } = useCart();
  if (isLoading) return <main className="mx-auto max-w-4xl px-4 py-24 text-center">Carregando checkout...</main>;
  if (!cart) return <main className="mx-auto max-w-4xl px-4 py-24 text-center"><h1 className="text-3xl font-semibold">Seu checkout</h1>
    {error ? <><p role="alert" className="mt-4">{error}</p><Button onClick={() => void refreshCart()} className="mt-4">Tentar novamente</Button><Link className="ml-4 underline" href="/acesso">Entrar na minha conta</Link></> : <Link className="mt-6 inline-block underline" href="/catalogo">Escolher produtos</Link>}
  </main>;
  if (!cart.items?.length) return <main className="px-4 py-24 text-center"><h1 className="text-3xl font-semibold">Seu carrinho está vazio.</h1><Link className="mt-6 inline-block underline" href="/catalogo">Voltar à loja</Link></main>;
  return <CheckoutForm key={cart.id} cart={cart} />;
}

function CheckoutForm({ cart }: { cart: StoreCart }) {
  const { updateCart, cartAction, error } = useCart();
  const [shipping, setShipping] = useState(() => fromMedusaAddress(cart.shipping_address));
  const [billing, setBilling] = useState(() => fromMedusaAddress(cart.billing_address));
  const [sameBilling, setSameBilling] = useState(true);
  const [method, setMethod] = useState<PaymentMethod | "">(() => (PAYMENT_METHODS as readonly unknown[]).includes(cart.metadata?.payment_method) ? cart.metadata?.payment_method as PaymentMethod : "");
  const [accepted, setAccepted] = useState(false);
  const [step, setStep] = useState<"address" | "review">("address");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [coupon, setCoupon] = useState("");
  const [shippingErrors, setShippingErrors] = useState<Partial<Record<keyof AddressDraft, string>>>({});
  const [billingErrors, setBillingErrors] = useState<Partial<Record<keyof AddressDraft, string>>>({});

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice("");
    const a = validateAddress(shipping), b = sameBilling ? {} : validateAddress(billing);
    setShippingErrors(a); setBillingErrors(b);
    const first = Object.keys(a)[0] ?? Object.keys(b)[0];
    if (first) { document.getElementById(`${Object.keys(a).length ? "shipping" : "billing"}-${first}`)?.focus(); return; }
    setBusy(true);
    try {
      if (await updateCart({ shipping, billing, same_billing_address: sameBilling })) setStep("review");
    } finally { setBusy(false); }
  }

  async function applyCoupon(event: FormEvent) {
    event.preventDefault(); setBusy(true); setNotice("");
    try {
      const result = await cartAction("apply_coupon", { cartId: cart.id, code: coupon });
      if (result) { setCoupon(""); setNotice("Cupom processado. Confira os descontos no resumo."); }
    } finally { setBusy(false); }
  }

  async function saveReview(event: FormEvent) {
    event.preventDefault(); setNotice("");
    if (!method || !accepted) { setNotice("Selecione uma forma de pagamento e aceite os termos."); return; }
    setBusy(true);
    try {
      if (await updateCart({ payment_method: method, terms_accepted: accepted })) {
        setNotice("Revisão salva. A finalização será liberada quando entrega e pagamento estiverem disponíveis. Nenhuma cobrança foi realizada.");
      }
    } finally { setBusy(false); }
  }

  return <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
    <Link href="/carrinho" className="inline-flex items-center gap-2 text-sm"><ArrowLeft className="size-4" />Voltar ao carrinho</Link>
    <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">Finalizar compra</h1>
    <ol aria-label="Etapas do checkout" className="mt-6 flex gap-6 text-sm"><li aria-current={step === "address" ? "step" : undefined}>1. Dados e endereço</li><li aria-current={step === "review" ? "step" : undefined}>2. Revisão e pagamento</li></ol>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="rounded-xl border p-5 sm:p-8">
        {step === "address" ? <form onSubmit={saveAddress} noValidate className="grid gap-6">
          <div><h2 className="text-xl font-semibold">Dados para entrega</h2><p className="mt-2 text-sm text-muted-foreground">E-mail da conta: {cart.email}</p></div>
          <AddressFields value={shipping} onChange={setShipping} prefix="shipping" errors={shippingErrors} />
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={sameBilling} onChange={(e) => setSameBilling(e.target.checked)} />Usar o mesmo endereço para cobrança</label>
          {!sameBilling ? <fieldset className="grid gap-4"><legend className="mb-4 font-semibold">Endereço de cobrança</legend><AddressFields value={billing} onChange={setBilling} prefix="billing" errors={billingErrors} /></fieldset> : null}
          <Button size="lg" disabled={busy}>{busy ? "Salvando..." : "Salvar e revisar"}</Button>
        </form> : <div className="grid gap-7">
          <div><h2 className="text-xl font-semibold">Revise sua compra</h2><p className="mt-3">{shipping.first_name} {shipping.last_name}</p><p className="text-sm text-muted-foreground">{shipping.street}, {shipping.number}{shipping.complement ? ` — ${shipping.complement}` : ""}<br />{shipping.neighborhood} — {shipping.city}/{shipping.province}<br />CEP {shipping.postal_code} · {shipping.phone}</p><Button type="button" variant="outline" className="mt-4" onClick={() => setStep("address")}>Editar endereço</Button></div>
          {!sameBilling ? <div><h3 className="font-semibold">Cobrança</h3><p className="text-sm">{billing.street}, {billing.number} — {billing.city}/{billing.province}</p></div> : null}
          <div className="rounded-lg bg-muted p-4"><h3 className="font-semibold">Entrega</h3><p className="mt-2 text-sm">A entrega ainda precisa ser definida. O frete não está incluído no valor abaixo.</p></div>
          <form onSubmit={saveReview} className="grid gap-5">
            <fieldset><legend className="mb-3 font-semibold">Como você prefere pagar?</legend><div className="grid gap-3 sm:grid-cols-3">{methods.map(({ id, label, icon: Icon }) => <label key={id} className={`flex cursor-pointer flex-col gap-3 rounded-lg border p-4 ${method === id ? "border-primary bg-secondary" : ""}`}><Icon className="size-5" /><span className="flex items-center gap-2 text-sm"><input type="radio" name="payment-method" value={id} checked={method === id} onChange={() => setMethod(id)} required />{label}</span></label>)}</div><p className="mt-3 text-xs text-muted-foreground">Esta seleção salva sua preferência. Nenhuma cobrança será feita nesta etapa.</p></fieldset>
            <label className="flex items-start gap-3 text-sm"><input className="mt-1" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} required /><span>Li e aceito os <Link href="/termos-de-uso" target="_blank" rel="noopener noreferrer" className="underline">termos de uso</Link> e li a <Link href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="underline">política de privacidade</Link>.</span></label>
            <Button size="lg" disabled={busy}>{busy ? "Salvando..." : "Salvar revisão"}</Button>
          </form>
        </div>}
        {error ? <p role="alert" className="mt-5 text-sm text-destructive">{error}</p> : null}
        {notice ? <p role="status" className="mt-5 text-sm">{notice}</p> : null}
      </section>
      <aside className="h-fit rounded-xl border p-6"><h2 className="text-lg font-semibold">Resumo do pedido</h2>
        <ul className="mt-5 grid gap-4">{cart.items?.map((item) => <li key={item.id} className="flex justify-between gap-3 text-sm"><span>{item.title}<span className="block text-xs text-muted-foreground">{item.variant_title} · {item.quantity} × {money(item.unit_price, cart.currency_code)}</span></span><span>{money(item.total, cart.currency_code)}</span></li>)}</ul>
        <form onSubmit={applyCoupon} className="mt-6"><label htmlFor="coupon" className="text-sm font-medium">Cupom de desconto</label><div className="mt-2 flex gap-2"><Input id="coupon" value={coupon} onChange={(e) => setCoupon(e.target.value)} maxLength={100} /><Button variant="outline" disabled={busy || !coupon.trim()}>Aplicar</Button></div></form>
        {cart.promotions?.map((promo) => <div key={promo.id} className="mt-3 flex items-center justify-between text-sm"><span>{promo.code}</span><Button type="button" variant="ghost" disabled={busy} onClick={async () => { setBusy(true); try { await cartAction("remove_coupon", { cartId: cart.id, code: promo.code }); } finally { setBusy(false); } }}>Remover</Button></div>)}
        <dl className="mt-6 grid grid-cols-2 gap-3 border-t pt-5 text-sm"><dt>Subtotal</dt><dd className="text-right">{money(cart.subtotal, cart.currency_code)}</dd><dt>Descontos</dt><dd className="text-right">− {money(cart.discount_total, cart.currency_code)}</dd><dt>Frete</dt><dd className="text-right">A definir</dd><dt className="font-semibold">Valor atual do carrinho</dt><dd className="text-right font-semibold">{money(cart.total, cart.currency_code)}</dd></dl>
        <p className="mt-4 text-xs text-muted-foreground">O total final será apresentado após a definição da entrega.</p>
      </aside>
    </div>
  </main>;
}
