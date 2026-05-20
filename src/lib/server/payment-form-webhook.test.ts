import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPaymentDatabase } from "./payments-db";
import { handleCashfreePaymentFormWebhook } from "./payment-form-webhook";

const paidPayload = {
  type: "PAYMENT_FORM_ORDER_WEBHOOK",
  event_time: "2026-05-20T10:00:00+05:30",
  data: {
    form: {
      form_id: "authenticleadership",
      cf_form_id: 2011640,
      form_url: "https://payments.cashfree.com/forms?code=authenticleadership",
      form_currency: "INR",
    },
    order: {
      order_amount: 99,
      order_id: "CFPay_test_paid_1",
      order_status: "PAID",
      transaction_id: 1021206,
      customer_details: {
        customer_phone: "9999999999",
        customer_email: "john@example.com",
        customer_name: "John Doe",
      },
    },
  },
};

describe("handleCashfreePaymentFormWebhook", () => {
  let tempDir: string;
  let dbPath: string;

  beforeEach(() => {
    tempDir = mkdtempSync(path.join(tmpdir(), "cashfree-webhook-"));
    dbPath = path.join(tempDir, "app.sqlite");
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("stores a paid order and sends one customer email", async () => {
    const emailSender = vi.fn().mockResolvedValue({ messageId: "smtp-1" });
    const db = createPaymentDatabase(dbPath);

    const result = await handleCashfreePaymentFormWebhook({
      payload: paidPayload,
      rawPayload: JSON.stringify(paidPayload),
      db,
      sendCustomerEmail: emailSender,
    });

    expect(result).toEqual({ status: 200, body: { ok: true, emailed: true } });
    expect(emailSender).toHaveBeenCalledOnce();
    expect(emailSender).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "john@example.com",
        customerName: "John Doe",
      }),
    );
    expect(db.getPaymentByOrderId("CFPay_test_paid_1")).toMatchObject({
      order_id: "CFPay_test_paid_1",
      order_status: "PAID",
      customer_email: "john@example.com",
      email_status: "sent",
    });
  });

  it("does not send a duplicate email for the same paid order", async () => {
    const emailSender = vi.fn().mockResolvedValue({ messageId: "smtp-1" });
    const db = createPaymentDatabase(dbPath);

    await handleCashfreePaymentFormWebhook({
      payload: paidPayload,
      rawPayload: JSON.stringify(paidPayload),
      db,
      sendCustomerEmail: emailSender,
    });
    const result = await handleCashfreePaymentFormWebhook({
      payload: paidPayload,
      rawPayload: JSON.stringify(paidPayload),
      db,
      sendCustomerEmail: emailSender,
    });

    expect(result).toEqual({
      status: 200,
      body: { ok: true, duplicate: true, emailed: false },
    });
    expect(emailSender).toHaveBeenCalledTimes(1);
  });

  it("stores non-paid events without sending email", async () => {
    const emailSender = vi.fn();
    const db = createPaymentDatabase(dbPath);
    const failedPayload = {
      ...paidPayload,
      data: {
        ...paidPayload.data,
        order: {
          ...paidPayload.data.order,
          order_id: "CFPay_test_failed_1",
          order_status: "FAILED",
        },
      },
    };

    const result = await handleCashfreePaymentFormWebhook({
      payload: failedPayload,
      rawPayload: JSON.stringify(failedPayload),
      db,
      sendCustomerEmail: emailSender,
    });

    expect(result).toEqual({ status: 200, body: { ok: true, emailed: false } });
    expect(emailSender).not.toHaveBeenCalled();
    expect(db.getPaymentByOrderId("CFPay_test_failed_1")).toMatchObject({
      order_status: "FAILED",
      email_status: "not_required",
    });
  });

  it("returns a retryable failure when SMTP fails after a paid order", async () => {
    const emailSender = vi.fn().mockRejectedValue(new Error("smtp down"));
    const db = createPaymentDatabase(dbPath);

    const result = await handleCashfreePaymentFormWebhook({
      payload: paidPayload,
      rawPayload: JSON.stringify(paidPayload),
      db,
      sendCustomerEmail: emailSender,
    });

    expect(result).toEqual({
      status: 500,
      body: { ok: false, error: "email_send_failed" },
    });
    expect(db.getPaymentByOrderId("CFPay_test_paid_1")).toMatchObject({
      email_status: "failed",
      last_email_error: "smtp down",
    });
  });

  it("accepts a paid order with no customer email without retrying forever", async () => {
    const emailSender = vi.fn();
    const db = createPaymentDatabase(dbPath);
    const noEmailPayload = {
      ...paidPayload,
      data: {
        ...paidPayload.data,
        order: {
          ...paidPayload.data.order,
          order_id: "CFPay_test_no_email_1",
          customer_details: {
            ...paidPayload.data.order.customer_details,
            customer_email: "",
          },
        },
      },
    };

    const result = await handleCashfreePaymentFormWebhook({
      payload: noEmailPayload,
      rawPayload: JSON.stringify(noEmailPayload),
      db,
      sendCustomerEmail: emailSender,
    });

    expect(result).toEqual({
      status: 200,
      body: { ok: true, emailed: false, reason: "missing_customer_email" },
    });
    expect(emailSender).not.toHaveBeenCalled();
    expect(db.getPaymentByOrderId("CFPay_test_no_email_1")).toMatchObject({
      email_status: "missing_email",
    });
  });
});
