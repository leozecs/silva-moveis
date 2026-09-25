import type { MedusaAddress } from "@/lib/checkout-contract";

export type CustomerProfile = { id: string; email: string; first_name?: string; last_name?: string; phone?: string };
export type CustomerAddress = MedusaAddress & { id: string; address_name?: string; is_default_shipping?: boolean; is_default_billing?: boolean };
export type CustomerOrder = {
  id: string; display_id: number; customer_id?: string; created_at: string;
  currency_code: string; total: number; subtotal?: number; shipping_total?: number; discount_total?: number;
  status: string; payment_status?: string; fulfillment_status?: string;
  items?: Array<{ id: string; title: string; variant_title?: string; quantity: number; unit_price: number; total: number; thumbnail?: string }>;
  shipping_address?: MedusaAddress;
  payment_collections?: Array<{ status?: string }>;
  fulfillments?: Array<{ id: string; canceled_at?: string | null; shipped_at?: string | null; delivered_at?: string | null }>;
};

export function orderLabel(order: Pick<CustomerOrder, "status" | "payment_status" | "fulfillment_status">) {
  if (order.status === "canceled") return "Cancelado";
  if (order.fulfillment_status === "delivered") return "Entregue";
  if (order.fulfillment_status === "partially_delivered") return "Entrega parcial";
  if (order.fulfillment_status === "shipped") return "Enviado";
  if (order.fulfillment_status === "partially_shipped") return "Envio parcial";
  if (order.payment_status === "refunded") return "Reembolsado";
  if (order.payment_status === "partially_refunded") return "Reembolso parcial";
  if (["fulfilled", "partially_fulfilled"].includes(order.fulfillment_status ?? "")) return "Preparando";
  if (order.payment_status === "captured") return "Pago";
  if (order.payment_status === "partially_captured") return "Pagamento parcial";
  if (order.payment_status === "authorized") return "Pagamento autorizado";
  if (["not_paid", "awaiting"].includes(order.payment_status ?? "")) return "Aguardando pagamento";
  return "Pedido recebido";
}
