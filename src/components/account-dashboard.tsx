"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CustomerLogoutButton } from "@/components/customer-logout-button";
import { AddressFields } from "@/components/address-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emptyAddress, fromMedusaAddress, validateAddress, type AddressDraft } from "@/lib/checkout-contract";
import { orderLabel, type CustomerProfile, type CustomerAddress, type CustomerOrder } from "@/lib/account";
import { money } from "@/lib/cart";

class AccountError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}
async function accountRequest<T>(query: string, signal?: AbortSignal, data?: unknown): Promise<T> {
  const response = await fetch(`/api/account${query}`, data ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), signal } : { cache: "no-store", signal });
  const payload = await response.json();
  if (!response.ok) throw new AccountError(payload.message ?? "Não foi possível acessar seus dados.", response.status);
  return payload;
}

function useAccountResource<T>(query: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    if (!query.startsWith("?section=order")) return;
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") refresh(); }, 15000);
    return () => window.clearInterval(timer);
  }, [query, refresh]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    accountRequest<T>(query, controller.signal).then((result) => { if (!controller.signal.aborted) { setData(result); setUnauthorized(false); } }).catch((cause) => {
      if (controller.signal.aborted) return;
      const denied = cause instanceof AccountError && [401, 403].includes(cause.status);
      if (denied) setData(null);
      setUnauthorized(denied); setError(cause instanceof Error ? cause.message : "Não foi possível acessar seus dados.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, revision]);
  return { data, error, unauthorized, loading, refresh };
}

function ResourceError({ message, unauthorized, retry }: { message: string; unauthorized?: boolean; retry: () => void }) {
  return <div role="alert" className="my-4 rounded-lg border p-4"><p>{message}</p>{unauthorized ? <Link href="/acesso" className="mt-3 inline-block underline">Entrar na minha conta</Link> : <Button type="button" variant="outline" className="mt-3" onClick={retry}>Tentar novamente</Button>}</div>;
}

export function AccountDashboard() {
  const [tab, setTab] = useState<"orders" | "addresses" | "profile">("orders");
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    const changed = () => setGeneration((value) => value + 1);
    const storage = (event: StorageEvent) => { if (event.key === "silva_session_changed") changed(); };
    window.addEventListener("silva-session-changed", changed); window.addEventListener("storage", storage);
    return () => { window.removeEventListener("silva-session-changed", changed); window.removeEventListener("storage", storage); };
  }, []);
  return <div className="mt-8"><div className="flex flex-wrap items-center justify-between gap-4"><nav aria-label="Minha conta" className="flex flex-wrap gap-2">{([['orders', 'Pedidos'], ['addresses', 'Endereços'], ['profile', 'Dados pessoais']] as const).map(([id, label]) => <Button key={id} onClick={() => setTab(id)} variant={tab === id ? "default" : "outline"} aria-current={tab === id ? "page" : undefined}>{label}</Button>)}</nav><CustomerLogoutButton /></div><section key={generation} className="mt-6 rounded-xl border p-5 sm:p-8">{tab === "orders" ? <Orders /> : tab === "addresses" ? <Addresses /> : <Profile />}</section></div>;
}

function Profile() {
  const resource = useAccountResource<{ customer: CustomerProfile }>("?section=profile");
  return <><h2 className="text-xl font-semibold">Dados pessoais</h2>{resource.error ? <ResourceError message={resource.error} unauthorized={resource.unauthorized} retry={resource.refresh} /> : null}{resource.loading ? <p className="mt-4" role="status">Carregando...</p> : resource.data ? <ProfileForm key={resource.data.customer.id} customer={resource.data.customer} /> : null}</>;
}
function ProfileForm({ customer }: { customer: CustomerProfile }) {
  const [form, setForm] = useState({ first_name: customer.first_name ?? "", last_name: customer.last_name ?? "", phone: customer.phone ?? "" });
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try { await accountRequest("", undefined, { action: "profile", ...form }); setMessage("Dados atualizados."); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Não foi possível salvar."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} className="mt-6 grid max-w-xl gap-5"><p className="text-sm">E-mail de acesso: {customer.email}</p>{([['first_name', 'Nome'], ['last_name', 'Sobrenome'], ['phone', 'Telefone com DDD']] as const).map(([key, label]) => <div key={key}><label htmlFor={`profile-${key}`} className="text-sm font-medium">{label}</label><Input id={`profile-${key}`} className="mt-2" type={key === "phone" ? "tel" : "text"} required maxLength={200} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></div>)}<Button disabled={busy}>{busy ? "Salvando..." : "Salvar dados"}</Button>{message ? <p role="status">{message}</p> : null}</form>;
}

function Addresses() {
  const [offset, setOffset] = useState(0);
  const resource = useAccountResource<{ addresses: CustomerAddress[]; count: number }>(`?section=addresses&offset=${offset}`);
  const [editing, setEditing] = useState<CustomerAddress | "new" | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function remove(id: string) {
    setBusy(true); setError("");
    try { await accountRequest("", undefined, { action: "delete_address", id }); setDeleting(null); resource.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível excluir."); }
    finally { setBusy(false); }
  }
  return <><div className="flex flex-wrap justify-between gap-4"><h2 className="text-xl font-semibold">Endereços</h2>{resource.data && !resource.unauthorized ? <Button variant="outline" onClick={() => setEditing("new")}>Adicionar endereço</Button> : null}</div>
    {resource.error ? <ResourceError message={resource.error} unauthorized={resource.unauthorized} retry={resource.refresh} /> : null}
    {error ? <p role="alert" className="mt-4 text-destructive">{error}</p> : null}
    {resource.loading ? <p className="mt-4" role="status">Carregando...</p> : null}
    {editing ? <AddressEditor key={editing === "new" ? "new" : editing.id} address={editing === "new" ? undefined : editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); resource.refresh(); }} /> : null}
    <div className="mt-6 grid gap-4 sm:grid-cols-2">{resource.data?.addresses.map((address) => <article key={address.id} className="rounded-lg border p-5"><h3 className="font-semibold">{address.first_name} {address.last_name}</h3><p className="mt-2 text-sm">{address.address_1}<br />{address.address_2}<br />{address.city}/{address.province?.toUpperCase()} · {address.postal_code}</p>{address.is_default_shipping ? <p className="mt-2 text-xs">Padrão para entrega</p> : null}{address.is_default_billing ? <p className="mt-2 text-xs">Padrão para cobrança</p> : null}<div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" onClick={() => setEditing(address)}>Editar</Button><Button variant="ghost" onClick={() => setDeleting(address.id)}>Excluir</Button></div>{deleting === address.id ? <div className="mt-4"><p className="text-sm">Excluir este endereço? Pedidos anteriores serão preservados.</p><div className="mt-2 flex gap-2"><Button variant="destructive" disabled={busy} onClick={() => void remove(address.id)}>Confirmar exclusão</Button><Button variant="outline" onClick={() => setDeleting(null)}>Voltar</Button></div></div> : null}</article>)}</div>
    {!resource.loading && resource.data?.count === 0 ? <p className="mt-4">Você ainda não cadastrou endereços.</p> : null}
    <Pagination offset={offset} total={resource.data?.count ?? 0} size={20} setOffset={setOffset} />
  </>;
}
function AddressEditor({ address, onCancel, onSaved }: { address?: CustomerAddress; onCancel: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState(() => address ? fromMedusaAddress(address) : { ...emptyAddress });
  const [shipping, setShipping] = useState(address?.is_default_shipping ?? false);
  const [billing, setBilling] = useState(address?.is_default_billing ?? false);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressDraft, string>>>({});
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function save(event: FormEvent) {
    event.preventDefault(); const errors = validateAddress(draft); setErrors(errors);
    if (Object.keys(errors).length) { document.getElementById(`account-${Object.keys(errors)[0]}`)?.focus(); return; }
    setBusy(true); setMessage("");
    try { await accountRequest("", undefined, { action: "save_address", id: address?.id, address: draft, is_default_shipping: shipping, is_default_billing: billing }); onSaved(); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Não foi possível salvar."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} noValidate className="mt-6 grid gap-5 rounded-lg border p-5"><h3 className="font-semibold">{address ? "Editar endereço" : "Novo endereço"}</h3><AddressFields prefix="account" value={draft} onChange={setDraft} errors={errors} /><label className="flex gap-2 text-sm"><input type="checkbox" checked={shipping} onChange={(e) => setShipping(e.target.checked)} />Padrão para entrega</label><label className="flex gap-2 text-sm"><input type="checkbox" checked={billing} onChange={(e) => setBilling(e.target.checked)} />Padrão para cobrança</label><div className="flex gap-3"><Button disabled={busy}>{busy ? "Salvando..." : "Salvar endereço"}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button></div>{message ? <p role="alert">{message}</p> : null}</form>;
}

function Pagination({ offset, size, total, setOffset }: { offset: number; size: number; total: number; setOffset: (offset: number) => void }) {
  if (total <= size && offset === 0) return null;
  return <nav aria-label="Paginação" className="mt-6 flex items-center gap-4"><Button variant="outline" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - size))}>Anterior</Button><span className="text-sm">Página {Math.floor(offset / size) + 1}</span><Button variant="outline" disabled={offset + size >= total} onClick={() => setOffset(offset + size)}>Próxima</Button></nav>;
}
function Orders() {
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const resource = useAccountResource<{ orders: CustomerOrder[]; count: number }>(`?section=orders&offset=${offset}`);
  if (selected) return <OrderDetail id={selected} back={() => setSelected(null)} />;
  return <><h2 className="text-xl font-semibold">Meus pedidos</h2>{resource.error ? <ResourceError message={resource.error} unauthorized={resource.unauthorized} retry={resource.refresh} /> : null}{resource.loading ? <p className="mt-4" role="status">Carregando...</p> : null}<div className="mt-6 grid gap-4">{resource.data?.orders.map((order) => <article key={order.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-5"><div><h3 className="font-semibold">Pedido #{order.display_id}</h3><p className="mt-1 text-sm">{new Date(order.created_at).toLocaleDateString("pt-BR")} · {orderLabel(order)}</p></div><p>{money(order.total, order.currency_code)}</p><Button variant="outline" onClick={() => setSelected(order.id)}>Ver pedido</Button></article>)}</div>{!resource.loading && resource.data?.count === 0 ? <p className="mt-4">Você ainda não tem pedidos. <Link href="/catalogo" className="underline">Explorar produtos</Link></p> : null}<Pagination offset={offset} total={resource.data?.count ?? 0} size={10} setOffset={setOffset} /></>;
}
function OrderDetail({ id, back }: { id: string; back: () => void }) {
  const resource = useAccountResource<{ order: CustomerOrder }>(`?section=order&id=${encodeURIComponent(id)}`);
  const order = resource.data?.order;
  return <><Button variant="outline" onClick={back}>Voltar aos pedidos</Button>{resource.error ? <ResourceError message={resource.error} unauthorized={resource.unauthorized} retry={resource.refresh} /> : null}{resource.loading ? <p className="mt-4" role="status">Carregando pedido...</p> : null}{order ? <div className="mt-6 grid gap-5"><h2 className="text-2xl font-semibold">Pedido #{order.display_id}</h2><p>{orderLabel(order)}</p><ul className="grid gap-3">{order.items?.map((item) => <li key={item.id} className="flex justify-between gap-4 border-b pb-3"><span>{item.title} · {item.variant_title}<span className="block text-sm text-muted-foreground">{item.quantity} × {money(item.unit_price, order.currency_code)}</span></span><span>{money(item.total, order.currency_code)}</span></li>)}</ul><p className="font-semibold">Total: {money(order.total, order.currency_code)}</p>{order.shipping_address ? <section><h3 className="font-semibold">Endereço desta compra</h3><p className="mt-2 text-sm">{order.shipping_address.first_name} {order.shipping_address.last_name}<br />{order.shipping_address.address_1} · {order.shipping_address.address_2}<br />{order.shipping_address.city}/{order.shipping_address.province?.toUpperCase()} · {order.shipping_address.postal_code}</p></section> : null}</div> : null}</>;
}
