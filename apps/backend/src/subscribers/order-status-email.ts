import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys, FulfillmentWorkflowEvents, Modules, OrderWorkflowEvents } from "@medusajs/framework/utils";

type EventData = { id?: string; order_id?: string; fulfillment_id?: string; no_notification?: boolean };

export default async function orderStatusEmail({ event, container }: SubscriberArgs<EventData>) {
  if (event.data.no_notification) return;
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    container.resolve(ContainerRegistrationKeys.LOGGER).warn("Order notification not sent: Resend is not configured.");
    return;
  }
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  let orderId = event.data.order_id;
  let template = "order-processing";
  if (event.name === OrderWorkflowEvents.PLACED) { orderId = event.data.id; template = "order-received"; }
  else if (event.name !== OrderWorkflowEvents.FULFILLMENT_CREATED) {
    const { data: fulfillments } = await query.graph({ entity: "fulfillment", fields: ["id", "canceled_at", "order.id"], filters: { id: event.data.id } });
    if (!fulfillments[0] || fulfillments[0].canceled_at) return;
    orderId = fulfillments[0].order?.id;
    template = event.name === FulfillmentWorkflowEvents.SHIPMENT_CREATED ? "order-shipped" : "order-delivered";
  }
  if (!orderId) throw new Error("Order notification has no linked order");
  const { data: orders } = await query.graph({ entity: "order", fields: ["id", "display_id", "email", "status"], filters: { id: orderId } });
  const order = orders[0];
  if (!order?.email || order.status === "canceled") return;
  const email = order.email;
  const key = `silva-${template}-${event.data.fulfillment_id ?? event.data.id ?? order.id}`;
  // Medusa persists delivery status and idempotency. The distributed lock
  // serializes concurrent subscriber deliveries; Resend deduplicates retries.
  await container.resolve(Modules.LOCKING).execute(key, async () => {
    await container.resolve(Modules.NOTIFICATION).createNotifications({
      to: email, channel: "email", template, resource_id: order.id, resource_type: "order",
      idempotency_key: key, provider_data: { idempotency_key: key }, data: { display_id: order.display_id },
    });
  }, { timeout: 30 });
}

export const config: SubscriberConfig = {
  event: [OrderWorkflowEvents.PLACED, OrderWorkflowEvents.FULFILLMENT_CREATED, FulfillmentWorkflowEvents.SHIPMENT_CREATED, FulfillmentWorkflowEvents.DELIVERY_CREATED],
  context: { subscriberId: "silva-order-status-email" },
};
