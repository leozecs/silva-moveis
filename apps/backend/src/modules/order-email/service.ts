import { AbstractNotificationProviderService } from "@medusajs/framework/utils";
import type { ProviderSendNotificationDTO, ProviderSendNotificationResultsDTO } from "@medusajs/framework/types";
import { Resend } from "resend";

const messages: Record<string, string> = {
  "order-received": "Recebemos seu pedido. A confirmação do pagamento será exibida na sua conta.",
  "order-processing": "Seu pedido entrou em processamento. Estamos preparando os itens para envio.",
  "order-shipped": "Uma entrega do seu pedido foi despachada. Acompanhe os detalhes na sua conta.",
  "order-delivered": "Uma entrega do seu pedido foi marcada como entregue. Confira os detalhes na sua conta.",
};

export default class OrderEmailProvider extends AbstractNotificationProviderService {
  static identifier = "silva-order-email";
  private client: Resend;
  private from: string;
  private storefront: string;

  constructor(_: unknown, options: { apiKey: string; from: string; storefrontUrl: string }) {
    super();
    if (!options.apiKey || !options.from) throw new Error("Order email credentials are missing");
    this.client = new Resend(options.apiKey);
    this.from = options.from;
    this.storefront = new URL("/minha-conta", options.storefrontUrl).href;
  }

  async send(notification: ProviderSendNotificationDTO): Promise<ProviderSendNotificationResultsDTO> {
    const message = messages[notification.template];
    const key = notification.provider_data?.idempotency_key;
    if (!message || typeof key !== "string" || notification.channel !== "email") throw new Error("Unsupported order notification");
    const number = String(notification.data?.display_id ?? "").replace(/[^0-9]/g, "");
    const result = await this.client.emails.send({
      from: this.from, to: notification.to,
      subject: `Atualização do pedido #${number} | Silva Móveis`,
      text: `Pedido #${number}\n\n${message}\n\nAcompanhe seu pedido: ${this.storefront}\n\nSilva Móveis`,
    }, { idempotencyKey: key });
    if (result.error || !result.data?.id) throw new Error(`Order email delivery failed: ${result.error?.name ?? "missing_id"}`);
    return { id: result.data.id };
  }
}
