import { randomUUID } from "node:crypto";
import { AbstractPaymentProvider, PaymentActions, PaymentSessionStatus } from "@medusajs/framework/utils";
import type { AuthorizePaymentInput, CancelPaymentInput, CapturePaymentInput, DeletePaymentInput, GetPaymentStatusInput, InitiatePaymentInput, ProviderWebhookPayload, RefundPaymentInput, RetrievePaymentInput, UpdatePaymentInput } from "@medusajs/framework/types";

export default class TestPaymentProvider extends AbstractPaymentProvider {
  static identifier = "silva-test";
  constructor(container: Record<string, unknown>, options: Record<string, unknown>) { super(container, options); TestPaymentProvider.validateOptions(); }
  static validateOptions() {
    if (process.env.NODE_ENV === "production" || process.env.SILVA_COMMERCE_TEST !== "true") throw new Error("Test payments are disabled outside the isolated test environment");
  }
  async initiatePayment(input: InitiatePaymentInput) {
    return { id: randomUUID(), status: PaymentSessionStatus.PENDING, data: { ...input.data, test_only: true, test_state: "pending" } };
  }
  async authorizePayment(input: AuthorizePaymentInput) {
    return { data: input.data ?? {}, status: input.data?.test_state === "approved" ? PaymentSessionStatus.AUTHORIZED : PaymentSessionStatus.PENDING_AUTHORIZATION };
  }
  async getPaymentStatus(input: GetPaymentStatusInput) {
    return { status: input.data?.test_state === "approved" ? PaymentSessionStatus.AUTHORIZED : PaymentSessionStatus.PENDING_AUTHORIZATION };
  }
  async retrievePayment(input: RetrievePaymentInput) { return { data: input.data ?? {} }; }
  async updatePayment(input: UpdatePaymentInput) { return { data: input.data ?? {}, status: PaymentSessionStatus.PENDING }; }
  async cancelPayment(input: CancelPaymentInput) { return { data: { ...input.data, test_state: "canceled" } }; }
  async deletePayment(input: DeletePaymentInput) { return { data: { ...input.data, test_state: "canceled" } }; }
  async capturePayment(input: CapturePaymentInput) {
    if (input.data?.test_state !== "approved") throw new Error("Test payment must be approved by an authorized test operator");
    return { data: { ...input.data, test_state: "captured" } };
  }
  async refundPayment(input: RefundPaymentInput) { return { data: { ...input.data, test_state: "refunded" } }; }
  async getWebhookActionAndData(_payload: ProviderWebhookPayload["payload"]) { return { action: PaymentActions.NOT_SUPPORTED as const }; }
}
