import type { RegistrationDatabase, RegistrationStatus } from "./registration-db";
import { scheduleReminderNotifications, sendAndRecordNotification } from "./notifications";

export type CashfreePaymentWebhookPayload = {
  type?: string;
  event_time?: string | null;
  data?: {
    order?: {
      order_id?: string | null;
      order_status?: string | null;
      order_amount?: number | null;
      order_currency?: string | null;
      transaction_id?: string | number | null;
      customer_details?: {
        customer_name?: string | null;
        customer_email?: string | null;
        customer_phone?: string | null;
      };
    };
    payment?: {
      cf_payment_id?: string | number | null;
      payment_status?: string | null;
      payment_time?: string | null;
    };
    customer_details?: {
      customer_name?: string | null;
      customer_email?: string | null;
      customer_phone?: string | null;
    };
  };
};

type HandleCashfreePaymentWebhookInput = {
  payload: CashfreePaymentWebhookPayload;
  rawPayload: string;
  db: RegistrationDatabase;
};

type HandlerResult = {
  status: number;
  body: Record<string, unknown>;
};

export async function handleCashfreePaymentWebhook({
  payload,
  rawPayload,
  db,
}: HandleCashfreePaymentWebhookInput): Promise<HandlerResult> {
  const eventType = payload.type;
  if (!eventType) {
    return { status: 400, body: { ok: false, error: "missing_event_type" } };
  }

  const order = payload.data?.order;
  const orderId = order?.order_id?.trim();
  if (!orderId) {
    return { status: 400, body: { ok: false, error: "missing_order_id" } };
  }

  const payment = payload.data?.payment;
  const paymentStatus = normalizeText(payment?.payment_status);
  const orderStatus = normalizeText(order?.order_status);
  const status = mapPaymentStatus(eventType, orderStatus, paymentStatus);
  const { registration, duplicatePaidWebhook } = await db.recordPaymentWebhook({
    orderId,
    eventType,
    orderStatus,
    paymentStatus,
    cfPaymentId: normalizeText(payment?.cf_payment_id || order.transaction_id),
    status,
    paidAt: status === "paid" ? payment?.payment_time || payload.event_time || new Date().toISOString() : null,
    rawPayload: parseRawPayload(rawPayload, payload),
  });

  if (!registration) {
    return { status: 200, body: { ok: true, ignored: true, reason: "unknown_order" } };
  }

  if (duplicatePaidWebhook) {
    return { status: 200, body: { ok: true, duplicate: true, paid: true } };
  }

  if (status !== "paid") {
    return { status: 200, body: { ok: true, paid: false } };
  }

  try {
    await sendAndRecordNotification({
      db,
      registration,
      channel: "email",
      templateKey: "payment_confirmation",
    });
  } catch {
    return { status: 500, body: { ok: false, error: "email_send_failed" } };
  }

  try {
    await sendAndRecordNotification({
      db,
      registration,
      channel: "whatsapp",
      templateKey: "payment_confirmation",
    });
  } catch {
    // WhatsApp provider details are intentionally configurable and should not
    // make Cashfree retry a successfully paid order forever.
  }

  await scheduleReminderNotifications(db, registration);

  return { status: 200, body: { ok: true, paid: true } };
}

function mapPaymentStatus(
  eventType: string,
  orderStatus?: string | null,
  paymentStatus?: string | null,
): RegistrationStatus {
  if (
    eventType === "PAYMENT_SUCCESS_WEBHOOK" ||
    orderStatus === "PAID" ||
    paymentStatus === "SUCCESS"
  ) {
    return "paid";
  }

  if (eventType === "PAYMENT_USER_DROPPED_WEBHOOK") {
    return "payment_dropped";
  }

  return "payment_failed";
}

function normalizeText(value?: string | number | null) {
  const normalized = value === undefined || value === null ? "" : String(value).trim();
  return normalized || null;
}

function parseRawPayload(rawPayload: string, fallback: CashfreePaymentWebhookPayload) {
  try {
    return JSON.parse(rawPayload);
  } catch {
    return fallback;
  }
}
