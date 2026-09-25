"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Bell, Boxes, Package, ShoppingBag, Tags, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerLogoutButton } from "@/components/customer-logout-button";
import { availableStock, type MerchantProduct, type MerchantCategory, type MerchantInventory, type MerchantOrder, type MerchantVariant } from "@/lib/merchant-types";
import { storefrontImageUrl } from "@/lib/medusa";
import { orderLabel } from "@/lib/account";

type Settings = { pricesVerified: boolean; emailConfigured: boolean; locations: { stock_locations: Array<{ id: string; name: string }> }; channels: { sales_channels: Array<{ id: string; name: string }> }; profiles: { shipping_profiles: Array<{ id: string; name: string }> } };
async function request<T>(query: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/merchant${query}`, { method: body ? "POST" : "GET", body: body ? JSON.stringify(body) : undefined, headers: body ? { "Content-Type": "application/json" } : undefined, cache: "no-store", signal });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message ?? "Não foi possível acessar a loja.");
  return payload;
}
function useResource<T>(query: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [updated, setUpdated] = useState("");
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function load() {
      try { const payload = await request<T>(query, undefined, controller.signal); if (!controller.signal.aborted) { setData(payload); setError(""); setUpdated(new Date().toLocaleTimeString("pt-BR")); } }
      catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Falha de conexão."); }
      finally { if (!controller.signal.aborted) timer = setTimeout(() => { if (document.hidden) timer = setTimeout(load, 15000); else void load(); }, 15000); }
    }
    void load();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [query, revision]);
  return { data, error, refresh, updated };
}
function useMutation(onDone: () => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const locked = useRef(false);
  async function run(body: unknown) {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError("");
    try { await request("", body); onDone(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha ao salvar."); }
    finally { locked.current = false; setBusy(false); }
  }
  return { run, busy, error };
}
function Feedback({ error, updated }: { error: string; updated?: string }) {
  return error ? <p role="alert" className="my-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p> : updated ? <p className="my-3 text-xs text-muted-foreground">Atualizado às {updated}. Atualização automática a cada 15 segundos.</p> : <p role="status" className="my-4 text-sm">Carregando...</p>;
}
function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => { const dialog = ref.current!; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={ref} onClose={() => { if (!ref.current?.open) close(); }} aria-labelledby={id} className="fixed inset-0 m-auto max-h-[90dvh] w-[min(95vw,900px)] overflow-y-auto rounded-xl bg-white p-5 shadow-xl backdrop:bg-black/50 sm:p-8"><div className="mb-6 flex items-center justify-between gap-4"><h2 id={id} className="text-xl font-semibold">{title}</h2><Button variant="ghost" size="icon" aria-label="Fechar" onClick={close}><X className="size-5" /></Button></div>{children}</dialog>;
}
function Picture({ src, name }: { src?: string | null; name: string }) {
  const url = storefrontImageUrl(src ?? null);
  return url ? <Image src={url} alt={name} width={80} height={80} unoptimized className="size-20 shrink-0 rounded-lg bg-muted object-contain" /> : <div className="grid size-20 shrink-0 place-items-center rounded bg-muted"><Package className="size-6" aria-label="Sem imagem" /></div>;
}
function Pagination({ offset, count, change }: { offset: number; count: number; change: (value: number) => void }) {
  return <div className="mt-5 flex items-center gap-4"><Button variant="outline" disabled={offset === 0} onClick={() => change(Math.max(0, offset - 20))}>Anterior</Button><span className="text-sm">{count ? offset + 1 : 0}–{Math.min(offset + 20, count)} de {count}</span><Button variant="outline" disabled={offset + 20 >= count} onClick={() => change(offset + 20)}>Próxima</Button></div>;
}

export function MerchantDashboard({ email }: { email: string }) {
  const [tab, setTab] = useState("products");
  const settings = useResource<Settings>("?resource=settings");
  const tabs = [{ id: "products", label: "Produtos", icon: Package }, { id: "categories", label: "Categorias", icon: Tags }, { id: "inventory", label: "Estoque", icon: Boxes }, { id: "notifications", label: "Notificações", icon: Bell }, { id: "orders", label: "Pedidos", icon: ShoppingBag }];
  return <main className="container-premium py-10"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-muted-foreground">{email}</p><h1 className="mt-2 text-3xl font-semibold">Painel do lojista</h1></div><CustomerLogoutButton /></div>
    <nav aria-label="Gestão da loja" className="my-8 flex flex-wrap gap-2">{tabs.map(({ id, label, icon: Icon }) => <Button key={id} variant={tab === id ? "default" : "outline"} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}><Icon className="size-4" />{label}</Button>)}</nav>
    {settings.error && <Feedback error={settings.error} />}
    {settings.data && !settings.data.pricesVerified && <p role="status" className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">A revisão monetária do catálogo ainda está pendente. Criação de produtos e alteração de preços estão bloqueadas para evitar valores incorretos. Categorias, imagens e estoque podem ser administrados.</p>}
    <section className="rounded-xl border bg-white p-4 sm:p-6" key={tab}>{tab === "products" ? <Products settings={settings.data} /> : tab === "categories" ? <Categories /> : tab === "orders" ? <Orders settings={settings.data} /> : <Inventory alerts={tab === "notifications"} settings={settings.data} />}</section>
  </main>;
}

function Products({ settings }: { settings: Settings | null }) {
  const [offset, setOffset] = useState(0);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const resource = useResource<{ products: MerchantProduct[]; count: number }>(`?resource=products&offset=${offset}&q=${encodeURIComponent(search)}`);
  const mutation = useMutation(resource.refresh);
  return <><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="text-xl font-semibold">Produtos</h2><Button disabled={!settings?.pricesVerified} onClick={() => setEditing("new")}>Novo produto</Button></div>
    <form className="my-5 flex gap-2" onSubmit={(event) => { event.preventDefault(); setOffset(0); setSearch(query); }}><Input aria-label="Pesquisar produtos no painel" placeholder="Nome ou referência do produto" value={query} onChange={(event) => setQuery(event.target.value)} /><Button variant="outline">Pesquisar</Button></form>
    <Feedback error={resource.error || mutation.error} updated={resource.updated} />
    <div className="divide-y">{resource.data?.products.map((product) => <article key={product.id} className="flex flex-wrap items-center gap-4 py-5"><Picture src={product.thumbnail} name={product.title} /><div className="min-w-40 flex-1"><h3 className="font-medium">{product.title}</h3><p className="mt-1 text-sm text-muted-foreground">{product.status === "published" ? "Online" : "Offline"} · {product.variants?.length ?? 0} variantes</p></div><Button variant="outline" onClick={() => setEditing(product.id)}>Editar</Button><Button variant="outline" disabled={mutation.busy} onClick={() => void mutation.run({ action: "product_status", id: product.id, updated_at: product.updated_at, status: product.status === "published" ? "draft" : "published" })}>{product.status === "published" ? "Despublicar" : "Publicar"}</Button></article>)}</div>
    {resource.data && <Pagination offset={offset} count={resource.data.count} change={setOffset} />}
    {editing && <ProductEditor id={editing} settings={settings} close={() => setEditing(null)} saved={() => { setEditing(null); resource.refresh(); }} />}
  </>;
}
function ProductEditor({ id, settings, close, saved }: { id: string; settings: Settings | null; close: () => void; saved: () => void }) {
  const resource = useResource<{ product: MerchantProduct }>(id === "new" ? "?resource=products&offset=0" : `?resource=product&id=${id}`);
  return <Modal title={id === "new" ? "Novo produto" : "Editar produto"} close={close}>{id === "new" || resource.data?.product ? <ProductForm key={id} product={resource.data?.product} settings={settings} saved={saved} /> : <Feedback error={resource.error} />}</Modal>;
}
function ProductForm({ product, settings, saved }: { product?: MerchantProduct; settings: Settings | null; saved: () => void }) {
  const categories = useResource<{ product_categories: MerchantCategory[] }>("?resource=categories");
  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [ids, setIds] = useState(product?.categories?.map((item) => item.id) ?? []);
  const [images, setImages] = useState(product?.images?.map((item) => item.url) ?? []);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [channel, setChannel] = useState(settings?.channels.sales_channels[0]?.id ?? "");
  const [profile, setProfile] = useState(settings?.profiles.shipping_profiles[0]?.id ?? "");
  const [confirm, setConfirm] = useState("");
  const mutation = useMutation(saved);
  async function upload(file?: File) {
    if (!file) return;
    setUploading(true); setUploadError("");
    try { const form = new FormData(); form.append("file", file); const response = await fetch("/api/merchant/upload", { method: "POST", body: form }); const data = await response.json(); if (!response.ok) throw new Error(data.message); setImages((current) => [...current, ...data.files.map((item: { url: string }) => item.url)]); }
    catch (error) { setUploadError(error instanceof Error ? error.message : "Falha no envio."); } finally { setUploading(false); }
  }
  return <><form className="grid gap-5" onSubmit={(event) => { event.preventDefault(); void mutation.run({ action: "save_product", id: product?.id, updated_at: product?.updated_at, title, description, category_ids: ids, images, sku, price: Number(price), sales_channel_id: channel, shipping_profile_id: profile }); }}>
    <label className="grid gap-2 text-sm">Nome do produto<Input required value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} /></label>
    <label className="grid gap-2 text-sm">Descrição<textarea className="min-h-24 rounded-lg border p-3" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} /></label>
    <fieldset><legend className="mb-2 text-sm font-medium">Categorias</legend><div className="flex max-h-40 flex-wrap gap-3 overflow-y-auto">{categories.data?.product_categories.map((item) => <label className="flex items-center gap-2 text-sm" key={item.id}><input type="checkbox" checked={ids.includes(item.id)} onChange={(event) => setIds((current) => event.target.checked ? [...current, item.id] : current.filter((value) => value !== item.id))} />{item.name}</label>)}</div></fieldset>
    <fieldset><legend className="mb-2 text-sm font-medium">Imagens do produto</legend><div className="flex flex-wrap gap-3">{images.map((url, index) => <div key={`${url}-${index}`}><Picture src={url} name={title} /><button type="button" className="mt-2 text-xs underline" onClick={() => setImages((current) => current.filter((_, position) => position !== index))}>Remover imagem {index + 1}</button></div>)}</div><label className="mt-4 grid gap-2 text-sm">Enviar imagem (PNG, JPEG ou WebP, até 2 MB)<input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading || images.length >= 20} onChange={(event) => void upload(event.target.files?.[0])} /></label>{uploadError && <p role="alert" className="text-sm text-red-700">{uploadError}</p>}</fieldset>
    {!product && <><label className="grid gap-2 text-sm">SKU<Input required value={sku} onChange={(event) => setSku(event.target.value)} /></label><label className="grid gap-2 text-sm">Preço em reais<Input required type="number" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} /></label><label className="grid gap-2 text-sm">Canal de vendas<select className="rounded border p-2" value={channel} onChange={(event) => setChannel(event.target.value)}>{settings?.channels.sales_channels.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="grid gap-2 text-sm">Perfil de entrega<select className="rounded border p-2" value={profile} onChange={(event) => setProfile(event.target.value)}>{settings?.profiles.shipping_profiles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><p className="text-sm text-muted-foreground">O produto será criado offline. Configure o estoque antes de publicá-lo.</p></>}
    {mutation.error && <p role="alert" className="text-sm text-red-700">{mutation.error}</p>}<Button disabled={mutation.busy || uploading || (!product && !settings?.pricesVerified)}>{mutation.busy ? "Salvando..." : "Salvar produto"}</Button>
  </form>
    {product && <><Variants product={product} verified={settings?.pricesVerified ?? false} refresh={saved} /><details className="mt-8 border-t pt-5"><summary className="cursor-pointer text-sm text-red-700">Remover produto</summary><p className="my-3 text-sm">Despublique o produto antes de removê-lo. Digite o nome exato para confirmar.</p><Input aria-label="Confirmar nome para remover" value={confirm} onChange={(event) => setConfirm(event.target.value)} /><Button variant="destructive" className="mt-3" disabled={mutation.busy || product.status !== "draft" || confirm !== product.title} onClick={() => void mutation.run({ action: "delete_product", id: product.id, confirmation: confirm })}>Remover produto</Button></details></>}
  </>;
}

function Variants({ product, verified, refresh }: { product: MerchantProduct; verified: boolean; refresh: () => void }) {
  const [editing, setEditing] = useState<MerchantVariant | "new" | null>(null);
  const [option, setOption] = useState("");
  const [values, setValues] = useState("");
  const mutation = useMutation(refresh);
  return <section className="mt-8 border-t pt-6"><h3 className="text-lg font-semibold">Variantes, cores e preços</h3><div className="my-4 grid gap-2">{product.variants?.map((variant) => <div key={variant.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"><span>{variant.title} · {variant.sku}</span><Button variant="outline" onClick={() => setEditing(variant)}>Editar variante</Button></div>)}</div><Button variant="outline" disabled={!verified} onClick={() => setEditing("new")}>Adicionar variante</Button>
    <details className="mt-5"><summary className="cursor-pointer text-sm">Adicionar opção (cor, tamanho ou acabamento)</summary><form className="mt-3 grid gap-3" onSubmit={(event) => { event.preventDefault(); void mutation.run({ action: "save_option", product_id: product.id, title: option, values: values.split(",").map((value) => value.trim()).filter(Boolean) }); }}><Input aria-label="Nome da opção" placeholder="Ex.: Cor" value={option} onChange={(event) => setOption(event.target.value)} required /><Input aria-label="Valores da opção" placeholder="Ex.: Azul, Branco, Preto" value={values} onChange={(event) => setValues(event.target.value)} required /><Button disabled={mutation.busy}>Criar opção</Button></form></details>
    {mutation.error && <p role="alert" className="mt-3 text-sm text-red-700">{mutation.error}</p>}
    {editing && <VariantForm key={typeof editing === "string" ? editing : editing.id} product={product} variant={editing === "new" ? undefined : editing} verified={verified} close={() => setEditing(null)} saved={refresh} />}
  </section>;
}
function VariantForm({ product, variant, verified, close, saved }: { product: MerchantProduct; variant?: MerchantVariant; verified: boolean; close: () => void; saved: () => void }) {
  const [title, setTitle] = useState(variant?.title ?? "");
  const [sku, setSku] = useState(variant?.sku ?? "");
  const [price, setPrice] = useState(String(variant?.prices?.find((item) => item.currency_code === "brl")?.amount ?? ""));
  const [hex, setHex] = useState(typeof variant?.metadata?.color_hex === "string" ? variant.metadata.color_hex : "");
  const [options, setOptions] = useState<Record<string, string>>(Object.fromEntries((product.options ?? []).map((item) => [item.title, variant?.options?.find((value) => value.option_id === item.id)?.value ?? item.values?.[0]?.value ?? ""])));
  const [images, setImages] = useState(variant?.images?.map((item) => item.id) ?? []);
  const mutation = useMutation(saved);
  return <Modal title={variant ? "Editar variante" : "Nova variante"} close={close}><form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); void mutation.run({ action: "save_variant", product_id: product.id, id: variant?.id, title, sku, price: Number(price), color_hex: hex, options }); }}><label className="grid gap-2 text-sm">Nome<Input required value={title} onChange={(event) => setTitle(event.target.value)} /></label><label className="grid gap-2 text-sm">SKU<Input required value={sku} onChange={(event) => setSku(event.target.value)} /></label><label className="grid gap-2 text-sm">Preço no Medusa (BRL)<Input type="number" min="0.01" step="0.01" required disabled={!verified} value={price} onChange={(event) => setPrice(event.target.value)} /></label>{!verified && <p className="text-sm text-amber-800">Preço bruto do backend. A revisão da escala monetária precisa ser concluída antes de alterar esta variante.</p>}
      {product.options?.map((option) => <label key={option.id} className="grid gap-2 text-sm">{option.title}<select className="rounded border p-2" value={options[option.title]} onChange={(event) => setOptions((current) => ({ ...current, [option.title]: event.target.value }))}>{option.values?.map((value) => <option key={value.value}>{value.value}</option>)}</select></label>)}
      <label className="grid gap-2 text-sm">Cor visual (hexadecimal, opcional)<Input placeholder="#123ABC" pattern="#[0-9a-fA-F]{6}" value={hex} onChange={(event) => setHex(event.target.value)} /></label><Button disabled={mutation.busy || !verified}>Salvar variante</Button>
    </form>{variant && <fieldset className="mt-6 border-t pt-5"><legend>Imagens desta variante</legend><div className="my-4 flex flex-wrap gap-4">{product.images?.map((image) => <label key={image.id} className="grid gap-2"><Picture src={image.url} name={product.title} /><span className="flex gap-2 text-sm"><input type="checkbox" checked={images.includes(image.id)} onChange={(event) => setImages((current) => event.target.checked ? [...current, image.id] : current.filter((id) => id !== image.id))} />Selecionar</span></label>)}</div><Button disabled={mutation.busy} onClick={() => void mutation.run({ action: "variant_images", product_id: product.id, variant_id: variant.id, image_ids: images })}>Salvar imagens da variante</Button></fieldset>}{mutation.error && <p role="alert" className="mt-4 text-sm text-red-700">{mutation.error}</p>}</Modal>;
}

function Categories() {
  const resource = useResource<{ product_categories: MerchantCategory[] }>("?resource=categories");
  const [id, setId] = useState<string>();
  const [name, setName] = useState("");
  const mutation = useMutation(() => { setId(undefined); setName(""); resource.refresh(); });
  return <><h2 className="text-xl font-semibold">Categorias</h2><form className="my-5 flex flex-wrap gap-3" onSubmit={(event) => { event.preventDefault(); void mutation.run({ action: "save_category", id, name }); }}><Input className="flex-1" aria-label="Nome da categoria" required value={name} onChange={(event) => setName(event.target.value)} /><Button disabled={mutation.busy}>{id ? "Salvar categoria" : "Criar categoria"}</Button>{id && <Button type="button" variant="ghost" onClick={() => { setId(undefined); setName(""); }}>Cancelar edição</Button>}</form><Feedback error={resource.error || mutation.error} updated={resource.updated} /><div className="divide-y">{resource.data?.product_categories.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span>{item.name}</span><div className="flex gap-2"><Button variant="outline" onClick={() => { setId(item.id); setName(item.name); }}>Editar</Button><Button variant="ghost" disabled={mutation.busy} onClick={() => { if (window.confirm(`Remover a categoria ${item.name}? Categorias com produtos não serão removidas.`)) void mutation.run({ action: "delete_category", id: item.id }); }}>Remover</Button></div></div>)}</div></>;
}

function Inventory({ alerts, settings }: { alerts: boolean; settings: Settings | null }) {
  const resource = useResource<{ inventory_items: MerchantInventory[] }>(`?resource=${alerts ? "notifications" : "inventory"}`);
  const [threshold, setThreshold] = useState(5);
  const items = resource.data?.inventory_items.filter((item) => !alerts || availableStock(item) <= threshold) ?? [];
  return <><h2 className="text-xl font-semibold">{alerts ? "Notificações de estoque" : "Estoque por localização"}</h2>{alerts && <label className="mt-4 flex items-center gap-3 text-sm">Alertar com até<Input className="w-20" type="number" min="0" max="100" value={threshold} onChange={(event) => setThreshold(Math.max(0, Math.min(100, Number(event.target.value))))} />unidades disponíveis</label>}<Feedback error={resource.error} updated={resource.updated} />{!items.length && resource.data && <p className="py-8 text-sm text-muted-foreground">{alerts ? "Nenhum alerta de estoque no momento." : "Nenhum item de estoque encontrado."}</p>}<div className="grid gap-4">{items.map((item) => <article key={item.id} className="rounded-xl border p-4"><div className="flex items-center gap-4"><Picture src={item.thumbnail} name={item.title ?? item.sku ?? "Produto"} /><div><h3 className="font-medium">{item.title ?? item.sku}</h3><p className="text-xs text-muted-foreground">{item.sku}</p><p className={`mt-2 text-sm ${availableStock(item) <= 0 ? "text-red-700" : "text-amber-800"}`}>{availableStock(item) <= 0 ? "Esgotado" : `${availableStock(item)} unidades disponíveis`}</p></div></div>{!alerts && <div className="mt-4 grid gap-3">{item.location_levels.map((level) => <StockForm key={`${level.location_id}:${level.stocked_quantity}`} item={item} level={level} locations={settings?.locations.stock_locations ?? []} refresh={resource.refresh} />)}{!item.location_levels.length && <StockForm item={item} locations={settings?.locations.stock_locations ?? []} refresh={resource.refresh} />}</div>}</article>)}</div></>;
}
function StockForm({ item, level, locations, refresh }: { item: MerchantInventory; level?: MerchantInventory["location_levels"][number]; locations: Array<{ id: string; name: string }>; refresh: () => void }) {
  const [quantity, setQuantity] = useState(String(level?.stocked_quantity ?? 0));
  const [location, setLocation] = useState(level?.location_id ?? locations[0]?.id ?? "");
  const mutation = useMutation(refresh);
  return <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); void mutation.run({ action: "set_stock", id: item.id, location_id: location, previous_quantity: level?.stocked_quantity, quantity: Number(quantity) }); }}><label className="grid gap-2 text-sm">Localização<select className="rounded border p-2" disabled={Boolean(level)} value={location} onChange={(event) => setLocation(event.target.value)}>{locations.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label><label className="grid gap-2 text-sm">Estoque físico<Input className="w-28" type="number" min={level?.reserved_quantity ?? 0} step="1" required value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label><span className="pb-2 text-sm">Reservado: {level?.reserved_quantity ?? 0}</span><Button variant="outline" disabled={mutation.busy || !location}>Atualizar estoque</Button>{mutation.error && <p role="alert" className="w-full text-sm text-red-700">{mutation.error}</p>}</form>;
}

function Orders({ settings }: { settings: Settings | null }) {
  const [period, setPeriod] = useState("day");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const resource = useResource<{ orders: MerchantOrder[]; count: number }>(`?resource=orders&period=${period}&offset=${offset}`);
  return <><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Pedidos</h2><label className="flex items-center gap-3 text-sm">Período<select className="rounded border p-2" value={period} onChange={(event) => { setPeriod(event.target.value); setOffset(0); }}><option value="day">Últimas 24 horas</option><option value="week">Últimos 7 dias</option><option value="all">Todos os pedidos</option></select></label></div><Feedback error={resource.error} updated={resource.updated} /><div className="divide-y">{resource.data?.orders.map((order) => <button key={order.id} className="flex w-full flex-wrap items-center justify-between gap-3 py-5 text-left hover:bg-muted/50" onClick={() => setSelected(order.id)}><span><span className="block font-medium">Pedido #{order.display_id}</span><span className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString("pt-BR")}</span></span><span className="text-sm">{order.email}</span><span className="rounded-full border px-3 py-1 text-xs">{orderLabel(order)}</span></button>)}</div>{resource.data && !resource.data.orders.length && <p className="py-8 text-muted-foreground">Nenhum pedido neste período.</p>}{resource.data && <Pagination offset={offset} count={resource.data.count} change={setOffset} />}{selected && <OrderModal id={selected} settings={settings} close={() => setSelected(null)} changed={resource.refresh} />}</>;
}
function OrderModal({ id, settings, close, changed }: { id: string; settings: Settings | null; close: () => void; changed: () => void }) {
  const resource = useResource<{ order: MerchantOrder }>(`?resource=order&id=${id}`);
  const [confirmed, setConfirmed] = useState(false);
  const [location, setLocation] = useState(settings?.locations.stock_locations[0]?.id ?? "");
  const mutation = useMutation(() => { resource.refresh(); changed(); setConfirmed(false); });
  const order = resource.data?.order;
  const fulfillments = order?.fulfillments?.filter((entry) => !entry.canceled_at) ?? [];
  return <Modal title={order ? `Pedido #${order.display_id}` : "Pedido"} close={close}><Feedback error={resource.error || mutation.error} updated={resource.updated} />{order && <><p className="font-medium">{orderLabel(order)}</p><section className="my-5 rounded-lg border p-4"><h3 className="font-semibold">Dados do cliente e entrega</h3><p className="mt-2 text-sm">{order.email}</p><div className="mt-2 text-sm">{["first_name", "last_name", "phone", "address_1", "address_2", "city", "province", "postal_code"].map((key) => order.shipping_address?.[key] ? <p key={key}>{order.shipping_address[key]}</p> : null)}</div></section><div className="grid gap-3">{order.items?.map((item) => <div key={item.id} className="flex items-center gap-3"><Picture src={item.thumbnail} name={item.title} /><span>{item.quantity} × {item.title}</span></div>)}</div>
    <p className="my-5 rounded border border-amber-200 bg-amber-50 p-3 text-sm">O status será atualizado no pedido. O envio de e-mail depende da configuração do servidor; a mudança de status não comprova o recebimento da mensagem.</p>
    <label className="my-5 flex items-center gap-3 text-sm"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />Conferi os dados do cliente e o endereço de entrega.</label>
    {order.payment_status !== "captured" ? <p className="text-sm">Aguarde a confirmação do pagamento para preparar o pedido.</p> : <div className="grid gap-3">{!fulfillments.length ? <><label className="grid gap-2 text-sm">Local de saída<select className="rounded border p-2" value={location} onChange={(event) => setLocation(event.target.value)}>{settings?.locations.stock_locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><Button disabled={!confirmed || mutation.busy || !location} onClick={() => void mutation.run({ action: "order_stage", id, stage: "processing", location_id: location, confirmed_customer: confirmed })}>Iniciar processamento</Button></> : fulfillments.map((fulfillment, index) => <div key={fulfillment.id} className="flex flex-wrap items-center gap-3"><span className="text-sm">Entrega {index + 1}</span>{fulfillment.delivered_at ? <span className="text-sm">Entregue</span> : <Button disabled={!confirmed || mutation.busy} onClick={() => void mutation.run({ action: "order_stage", id, stage: fulfillment.shipped_at ? "delivered" : "shipped", fulfillment_id: fulfillment.id, confirmed_customer: confirmed })}>{fulfillment.shipped_at ? "Confirmar entrega" : "Saiu para entrega"}</Button>}</div>)}</div>}
  </>}</Modal>;
}
