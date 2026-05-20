import type { CustomerEmailInput } from "./email";
import type { PaymentDatabase } from "./payments-db";
import { sendCustomerConfirmationEmail } from "./email";

export type CashfreePaymentFormPayload = {
  type?: string;
  data?: {
    form?: {
      form_id?: string | null;
    };
    order?: {
      order_id?: string | null;
      order_status?: string | null;
      order_amount?: number | null;
      transaction_id?: string | number | null;
      customer_details?: {
        customer_name?: string | null;
        customer_email?: string | null;
        customer_phone?: string | null;
      };
    };
  };
};

type HandleCashfreePaymentFormWebhookInput = {
  payload: CashfreePaymentFormPayload;
  rawPayload: string;
  db: PaymentDatabase;
  sendCustomerEmail?: (input: CustomerEmailInput) => Promise<{ messageId?: string }>;
};

type HandlerResult = {
  status: number;
  body: Record<string, unknown>;
};

const PAID_STATUS = "PAID";
const PAYMENT_FORM_EVENT = "PAYMENT_FORM_ORDER_WEBHOOK";

export async function handleCashfreePaymentFormWebhook({
  payload,
  rawPayload,
  db,
  sendCustomerEmail = sendCustomerConfirmationEmail,
}: HandleCashfreePaymentFormWebhookInput): Promise<HandlerResult> {
  if (payload.type !== PAYMENT_FORM_EVENT) {
    return { status: 200, body: { ok: true, ignored: true } };
  }

  const order = payload.data?.order;
  const orderId = order?.order_id?.trim();
  if (!order || !orderId) {
    return { status: 400, body: { ok: false, error: "invalid_payload" } };
  }

  const customer = order.customer_details;
  const previousRecord = db.getPaymentByOrderId(orderId);
  db.upsertPaymentEvent({
    eventType: payload.type,
    orderId,
    transactionId: order.transaction_id,
    orderStatus: order.order_status || "UNKNOWN",
    orderAmount: order.order_amount ?? null,
    customerName: normalizeText(customer?.customer_name),
    customerEmail: normalizeText(customer?.customer_email),
    customerPhone: normalizeText(customer?.customer_phone),
    formId: normalizeText(payload.data?.form?.form_id),
    rawPayload,
  });

  if (previousRecord?.email_status === "sent") {
    return {
      status: 200,
      body: { ok: true, duplicate: true, emailed: false },
    };
  }

  if (order.order_status !== PAID_STATUS) {
    db.markEmailNotRequired(orderId);
    return { status: 200, body: { ok: true, emailed: false } };
  }

  const customerEmail = normalizeText(customer?.customer_email);
  if (!customerEmail) {
    db.markEmailMissing(orderId);
    return {
      status: 200,
      body: { ok: true, emailed: false, reason: "missing_customer_email" },
    };
  }

  try {
    const result = await sendCustomerEmail({
      to: customerEmail,
      customerName: normalizeText(customer?.customer_name),
    });
    db.markEmailSent(orderId, customerEmail, result.messageId);
    return { status: 200, body: { ok: true, emailed: true } };
  } catch (error) {
    db.markEmailFailed(orderId, customerEmail, errorMessage(error));
    return {
      status: 500,
      body: { ok: false, error: "email_send_failed" },
    };
  }
}

function normalizeText(value?: string | null) {
  const normalized = value?.trim();
  return normalized || null;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown email error";
}
