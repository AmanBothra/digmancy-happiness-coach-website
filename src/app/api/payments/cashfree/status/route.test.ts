import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SeminarRegistration } from "@/lib/server/registration-db";

const mocks = vi.hoisted(() => ({
  getRegistrationByOrderId: vi.fn(),
  getCashfreeOrder: vi.fn(),
  reconcileCashfreeOrderPayment: vi.fn(),
}));

vi.mock("@/lib/server/registration-db", () => ({
  createRegistrationDatabase: () => ({
    getRegistrationByOrderId: mocks.getRegistrationByOrderId,
  }),
}));

vi.mock("@/lib/server/cashfree-order", () => ({
  getCashfreeOrder: mocks.getCashfreeOrder,
}));

vi.mock("@/lib/server/cashfree-payment-webhook", () => ({
  reconcileCashfreeOrderPayment: mocks.reconcileCashfreeOrderPayment,
}));

import { GET } from "./route";

const pendingRegistration: SeminarRegistration = {
  id: "reg-1",
  order_id: "alc_test_status_1",
  cf_order_id: "cf-order-1",
  payment_session_id: "session-1",
  name: "Aman Bothra",
  email: "aman@example.com",
  mobile: "919999999999",
  city: "Kolkata",
  profession: "Founder",
  amount: 149,
  currency: "INR",
  status: "pending_payment",
  cashfree_order_status: "ACTIVE",
  cashfree_payment_status: null,
  cf_payment_id: null,
  paid_at: null,
  webinar_start_at: "2026-06-28T05:30:00.000Z",
  webinar_date_label: "Sunday 28 June",
  webinar_time_label: "11:00 AM IST",
  joining_link: "https://zoom.example.com/join",
  raw_create_order_response: null,
  raw_latest_webhook: null,
  last_error: null,
  reminders_scheduled_at: null,
  created_at: "2026-06-18T08:21:31.530Z",
  updated_at: "2026-06-18T08:21:32.197Z",
};

describe("GET /api/payments/cashfree/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getRegistrationByOrderId.mockResolvedValue(pendingRegistration);
    mocks.getCashfreeOrder.mockResolvedValue({
      order_id: "alc_test_status_1",
      order_status: "PAID",
      cf_order_id: "cf-order-1",
    });
    mocks.reconcileCashfreeOrderPayment.mockResolvedValue({
      registration: {
        ...pendingRegistration,
        status: "paid",
        cashfree_order_status: "PAID",
        cashfree_payment_status: "SUCCESS",
        paid_at: "2026-06-18T08:25:00.000Z",
      },
      notificationFailures: [],
    });
  });

  it("reconciles a pending DB row with Cashfree before returning status", async () => {
    const response = await GET(
      new Request(
        "https://authenticleadershipcircle.com/api/payments/cashfree/status?order_id=alc_test_status_1",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      orderId: "alc_test_status_1",
      status: "paid",
      paymentStatus: "SUCCESS",
      orderStatus: "PAID",
      paidAt: "2026-06-18T08:25:00.000Z",
    });
    expect(mocks.getCashfreeOrder).toHaveBeenCalledWith("alc_test_status_1");
    expect(mocks.reconcileCashfreeOrderPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "alc_test_status_1",
        cashfreeOrder: expect.objectContaining({ order_status: "PAID" }),
      }),
    );
  });

  it("does not call Cashfree when the registration is already paid", async () => {
    mocks.getRegistrationByOrderId.mockResolvedValue({
      ...pendingRegistration,
      status: "paid",
      cashfree_order_status: "PAID",
      cashfree_payment_status: "SUCCESS",
      paid_at: "2026-06-18T08:25:00.000Z",
    });

    const response = await GET(
      new Request(
        "https://authenticleadershipcircle.com/api/payments/cashfree/status?order_id=alc_test_status_1",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("paid");
    expect(mocks.getCashfreeOrder).not.toHaveBeenCalled();
    expect(mocks.reconcileCashfreeOrderPayment).not.toHaveBeenCalled();
  });
});
