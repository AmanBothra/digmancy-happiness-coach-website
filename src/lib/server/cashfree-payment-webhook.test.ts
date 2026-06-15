import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendSeminarEmail } from "./email";
import { sendWhatsappMessage } from "./whatsapp";
import { handleCashfreePaymentWebhook } from "./cashfree-payment-webhook";
import type {
  NotificationLogInput,
  QueueScheduledNotificationInput,
  RegistrationDatabase,
  ScheduledNotification,
  SeminarRegistration,
} from "./registration-db";

vi.mock("./email", () => ({
  sendSeminarEmail: vi.fn().mockResolvedValue({ messageId: "email-1" }),
}));

vi.mock("./whatsapp", () => ({
  sendWhatsappMessage: vi.fn().mockResolvedValue({ messageId: "wa-1" }),
}));

const registration: SeminarRegistration = {
  id: "reg-1",
  order_id: "alc_test_1",
  cf_order_id: "cf-1",
  payment_session_id: "session-1",
  name: "John Doe",
  email: "john@example.com",
  mobile: "9999999999",
  amount: 99,
  currency: "INR",
  status: "pending_payment",
  cashfree_order_status: "ACTIVE",
  cashfree_payment_status: null,
  cf_payment_id: null,
  paid_at: null,
  webinar_start_at: "2026-06-14T05:00:00.000Z",
  webinar_date_label: "Sunday 14 June",
  webinar_time_label: "10:30 AM IST",
  joining_link: "https://zoom.example.com/join",
  raw_create_order_response: null,
  raw_latest_webhook: null,
  last_error: null,
  reminders_scheduled_at: null,
  created_at: "2026-06-12T04:30:00.000Z",
  updated_at: "2026-06-12T04:30:00.000Z",
};

describe("handleCashfreePaymentWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records a paid order, sends confirmation notifications, and queues reminders", async () => {
    const db = createFakeDb();
    const payload = {
      type: "PAYMENT_SUCCESS_WEBHOOK",
      event_time: "2026-06-12T10:00:00+05:30",
      data: {
        order: {
          order_id: "alc_test_1",
          order_amount: 99,
          order_currency: "INR",
        },
        payment: {
          cf_payment_id: "1453002795",
          payment_status: "SUCCESS",
          payment_time: "2026-06-12T10:01:00+05:30",
        },
        customer_details: {
          customer_name: "John Doe",
          customer_email: "john@example.com",
          customer_phone: "9999999999",
        },
      },
    };

    const result = await handleCashfreePaymentWebhook({
      payload,
      rawPayload: JSON.stringify(payload),
      db,
    });

    expect(result).toEqual({ status: 200, body: { ok: true, paid: true } });
    expect(db.webhookStatus).toBe("paid");
    expect(sendSeminarEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "john@example.com",
        customerName: "John Doe",
        templateKey: "payment_confirmation",
      }),
    );
    expect(sendWhatsappMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "9999999999",
        templateKey: "payment_confirmation",
      }),
    );
    expect(db.logs).toHaveLength(2);
    expect(db.queued).toHaveLength(6);
    expect(db.queued.map((item) => item.templateKey)).toEqual([
      "two_days_before",
      "two_days_before",
      "one_day_before",
      "one_day_before",
      "one_hour_before",
      "one_hour_before",
    ]);
  });
});

function createFakeDb() {
  const logs: NotificationLogInput[] = [];
  const queued: QueueScheduledNotificationInput[] = [];
  let webhookStatus = "";

  const db: RegistrationDatabase & {
    logs: NotificationLogInput[];
    queued: QueueScheduledNotificationInput[];
    webhookStatus: string;
  } = {
    logs,
    queued,
    get webhookStatus() {
      return webhookStatus;
    },
    async createPendingRegistration() {
      return registration;
    },
    async recordInitiatedCashfreeOrder() {
      return registration;
    },
    async recordOrderCreated() {
      return registration;
    },
    async markOrderCreationFailed() {},
    async getRegistrationByOrderId() {
      return registration;
    },
    async recordPaymentWebhook(input) {
      webhookStatus = input.status;
      return {
        ...registration,
        status: input.status,
        cashfree_payment_status: input.paymentStatus || null,
        cf_payment_id: input.cfPaymentId || null,
        paid_at: input.paidAt || null,
      };
    },
    async hasSentNotification() {
      return false;
    },
    async recordNotificationLog(input) {
      logs.push(input);
    },
    async queueScheduledNotifications(input) {
      queued.push(...input);
    },
    async listDueScheduledNotifications() {
      return [] satisfies ScheduledNotification[];
    },
    async getRegistrationById() {
      return registration;
    },
    async markScheduledNotificationSent() {},
    async markScheduledNotificationFailed() {},
  };

  return db;
}
