import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createCashfreeOrder: vi.fn(),
  createLocalOrderId: vi.fn(() => "alc_test_atomic_1"),
  getCashfreeMode: vi.fn(() => "sandbox"),
  recordInitiatedCashfreeOrder: vi.fn(),
}));

vi.mock("@/lib/server/cashfree-order", () => ({
  createCashfreeOrder: mocks.createCashfreeOrder,
  createLocalOrderId: mocks.createLocalOrderId,
  getCashfreeMode: mocks.getCashfreeMode,
}));

vi.mock("@/lib/server/registration-db", () => ({
  createRegistrationDatabase: () => ({
    recordInitiatedCashfreeOrder: mocks.recordInitiatedCashfreeOrder,
  }),
}));

import { POST } from "./route";

describe("POST /api/payments/cashfree/order", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.APP_ENV = "production";
    process.env.APP_BASE_URL_PRODUCTION = "https://authenticleadershipcircle.com";
    process.env.REGISTRATION_AMOUNT = "149";
    process.env.WEBINAR_START_AT_ISO = "2026-06-28T05:30:00.000Z";
    process.env.WEBINAR_DISPLAY_DATE = "Sunday 28 June";
    process.env.WEBINAR_DISPLAY_TIME = "11:00 AM IST";
    process.env.WEBINAR_JOINING_LINK = "https://zoom.example.com/join";

    mocks.createCashfreeOrder.mockResolvedValue({
      cf_order_id: "cf_order_atomic_1",
      order_status: "ACTIVE",
      payment_session_id: "payment_session_atomic_1",
    });
  });

  afterEach(() => {
    delete process.env.APP_ENV;
    delete process.env.APP_BASE_URL_PRODUCTION;
    delete process.env.REGISTRATION_AMOUNT;
    delete process.env.WEBINAR_START_AT_ISO;
    delete process.env.WEBINAR_DISPLAY_DATE;
    delete process.env.WEBINAR_DISPLAY_TIME;
    delete process.env.WEBINAR_JOINING_LINK;
  });

  it("creates the gateway order before atomically persisting initiated registration state", async () => {
    const request = new Request("https://authenticleadershipcircle.com/api/payments/cashfree/order", {
      method: "POST",
      body: JSON.stringify({
        name: "Aman Bothra",
        email: "aman@example.com",
        mobile: "9999999999",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      orderId: "alc_test_atomic_1",
      paymentSessionId: "payment_session_atomic_1",
      cashfreeMode: "sandbox",
    });
    expect(mocks.createCashfreeOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "alc_test_atomic_1",
        amount: 149,
        customerEmail: "aman@example.com",
        customerPhone: "919999999999",
      }),
    );
    expect(mocks.recordInitiatedCashfreeOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "alc_test_atomic_1",
        name: "Aman Bothra",
        email: "aman@example.com",
        mobile: "919999999999",
        amount: 149,
        paymentSessionId: "payment_session_atomic_1",
        cfOrderId: "cf_order_atomic_1",
        orderStatus: "ACTIVE",
        webinarDateLabel: "Sunday 28 June",
        webinarTimeLabel: "11:00 AM IST",
      }),
    );
    expect(mocks.recordInitiatedCashfreeOrder.mock.invocationCallOrder[0]).toBeGreaterThan(
      mocks.createCashfreeOrder.mock.invocationCallOrder[0],
    );
  });

  it("does not persist a registration when Cashfree order creation fails", async () => {
    mocks.createCashfreeOrder.mockRejectedValue(new Error("cashfree unavailable"));
    const request = new Request("https://authenticleadershipcircle.com/api/payments/cashfree/order", {
      method: "POST",
      body: JSON.stringify({
        name: "Aman Bothra",
        email: "aman@example.com",
        mobile: "9999999999",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toEqual({
      ok: false,
      error: "cashfree_order_failed",
      message: "cashfree unavailable",
    });
    expect(mocks.recordInitiatedCashfreeOrder).not.toHaveBeenCalled();
  });
});
