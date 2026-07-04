import { describe, expect, it, vi } from "vitest";
import { createRegistrationDatabase } from "./registration-db";

describe("createRegistrationDatabase", () => {
  it("records Cashfree webhook event and registration update through one atomic RPC", async () => {
    const registration = {
      id: "reg-1",
      order_id: "alc_test_1",
      cf_order_id: "cf-1",
      payment_session_id: "session-1",
      name: "Aman",
      email: "aman@example.com",
      mobile: "919999999999",
      city: "Kolkata",
      profession: "Founder",
      amount: 149,
      currency: "INR",
      status: "paid",
      cashfree_order_status: "ACTIVE",
      cashfree_payment_status: "SUCCESS",
      cf_payment_id: "cf-payment-1",
      paid_at: "2026-06-18T07:12:12.000Z",
      webinar_start_at: "2030-01-06T05:30:00.000Z",
      webinar_date_label: "Sunday 6 January",
      webinar_time_label: "11:00 AM IST",
      joining_link: "https://zoom.example.com/join",
      raw_create_order_response: null,
      raw_latest_webhook: { type: "PAYMENT_SUCCESS_WEBHOOK" },
      last_error: null,
      reminders_scheduled_at: null,
      created_at: "2026-06-18T07:12:04.000Z",
      updated_at: "2026-06-18T07:12:39.000Z",
    };
    const rpc = vi.fn().mockResolvedValue({
      data: {
        registration,
        duplicatePaidWebhook: false,
      },
      error: null,
    });
    const db = createRegistrationDatabase({ rpc } as never);

    const result = await db.recordPaymentWebhook({
      orderId: "alc_test_1",
      eventType: "PAYMENT_SUCCESS_WEBHOOK",
      orderStatus: "ACTIVE",
      paymentStatus: "SUCCESS",
      cfPaymentId: "cf-payment-1",
      status: "paid",
      paidAt: "2026-06-18T07:12:12.000Z",
      rawPayload: { type: "PAYMENT_SUCCESS_WEBHOOK" },
    });

    expect(rpc).toHaveBeenCalledWith("record_cashfree_payment_webhook_atomic", {
      p_order_id: "alc_test_1",
      p_event_type: "PAYMENT_SUCCESS_WEBHOOK",
      p_order_status: "ACTIVE",
      p_payment_status: "SUCCESS",
      p_cf_payment_id: "cf-payment-1",
      p_status: "paid",
      p_paid_at: "2026-06-18T07:12:12.000Z",
      p_raw_payload: { type: "PAYMENT_SUCCESS_WEBHOOK" },
    });
    expect(result).toEqual({ registration, duplicatePaidWebhook: false });
  });

  it("claims due scheduled notifications through one atomic RPC", async () => {
    const notification = {
      id: "sched-1",
      registration_id: "reg-1",
      order_id: "alc_test_1",
      channel: "email",
      template_key: "one_hour_before",
      recipient: "aman@example.com",
      scheduled_for: "2026-06-18T07:30:00.000Z",
      status: "processing",
      attempts: 0,
      last_error: null,
    };
    const rpc = vi.fn().mockResolvedValue({
      data: [notification],
      error: null,
    });
    const db = createRegistrationDatabase({ rpc } as never);

    const result = await db.listDueScheduledNotifications(25);

    expect(rpc).toHaveBeenCalledWith("claim_due_scheduled_notifications", {
      p_limit: 25,
    });
    expect(result).toEqual([notification]);
  });
});
