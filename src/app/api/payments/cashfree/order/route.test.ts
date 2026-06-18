import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createCashfreeOrder: vi.fn(),
  createLocalOrderId: vi.fn(() => "alc_test_atomic_1"),
  getCashfreeMode: vi.fn(() => "sandbox"),
  createPendingRegistration: vi.fn(),
  recordOrderCreated: vi.fn(),
  markOrderCreationFailed: vi.fn(),
}));

vi.mock("@/lib/server/cashfree-order", () => ({
  createCashfreeOrder: mocks.createCashfreeOrder,
  createLocalOrderId: mocks.createLocalOrderId,
  getCashfreeMode: mocks.getCashfreeMode,
}));

vi.mock("@/lib/server/registration-db", () => ({
  createRegistrationDatabase: () => ({
    createPendingRegistration: mocks.createPendingRegistration,
    recordOrderCreated: mocks.recordOrderCreated,
    markOrderCreationFailed: mocks.markOrderCreationFailed,
  }),
}));

import { POST } from "./route";

describe("POST /api/payments/cashfree/order", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.APP_ENV = "production";
    process.env.APP_FRONTEND_BASE_URL_PRODUCTION = "https://authenticleadershipcircle.com";
    process.env.APP_BACKEND_BASE_URL_PRODUCTION = "https://authenticleadershipcircle.com";
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
    mocks.createPendingRegistration.mockResolvedValue({});
    mocks.recordOrderCreated.mockResolvedValue({});
    mocks.markOrderCreationFailed.mockResolvedValue(undefined);
  });

  afterEach(() => {
    delete process.env.APP_ENV;
    delete process.env.APP_FRONTEND_BASE_URL_PRODUCTION;
    delete process.env.APP_BACKEND_BASE_URL_PRODUCTION;
    delete process.env.REGISTRATION_AMOUNT;
    delete process.env.WEBINAR_START_AT_ISO;
    delete process.env.WEBINAR_DISPLAY_DATE;
    delete process.env.WEBINAR_DISPLAY_TIME;
    delete process.env.WEBINAR_JOINING_LINK;
  });

  it("persists a local pending registration before creating the gateway order", async () => {
    const request = new Request("https://authenticleadershipcircle.com/api/payments/cashfree/order", {
      method: "POST",
      body: JSON.stringify({
        name: "Aman Bothra",
        email: "aman@example.com",
        mobile: "9999999999",
        city: "Kolkata",
        profession: "Founder",
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
        city: "Kolkata",
        profession: "Founder",
        returnUrl:
          "https://authenticleadershipcircle.com/payment-status?order_id=alc_test_atomic_1",
        notifyUrl: "https://authenticleadershipcircle.com/api/webhooks/cashfree/payments",
      }),
    );
    expect(mocks.createPendingRegistration).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "alc_test_atomic_1",
        name: "Aman Bothra",
        email: "aman@example.com",
        mobile: "919999999999",
        city: "Kolkata",
        profession: "Founder",
        amount: 149,
        webinarDateLabel: "Sunday 28 June",
        webinarTimeLabel: "11:00 AM IST",
      }),
    );
    expect(mocks.recordOrderCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "alc_test_atomic_1",
        paymentSessionId: "payment_session_atomic_1",
        cfOrderId: "cf_order_atomic_1",
        orderStatus: "ACTIVE",
      }),
    );
    expect(mocks.createCashfreeOrder.mock.invocationCallOrder[0]).toBeGreaterThan(
      mocks.createPendingRegistration.mock.invocationCallOrder[0],
    );
    expect(mocks.recordOrderCreated.mock.invocationCallOrder[0]).toBeGreaterThan(
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
        city: "Kolkata",
        profession: "Founder",
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
    expect(mocks.createPendingRegistration).toHaveBeenCalledTimes(1);
    expect(mocks.recordOrderCreated).not.toHaveBeenCalled();
    expect(mocks.markOrderCreationFailed).toHaveBeenCalledWith(
      "alc_test_atomic_1",
      "cashfree unavailable",
    );
  });

  it("rejects missing city and profession before creating a Cashfree order", async () => {
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

    expect(response.status).toBe(400);
    expect(body).toEqual({
      ok: false,
      error: "invalid_registration",
      fields: {
        city: "City is required",
        profession: "Profession is required",
      },
    });
    expect(mocks.createCashfreeOrder).not.toHaveBeenCalled();
    expect(mocks.createPendingRegistration).not.toHaveBeenCalled();
    expect(mocks.recordOrderCreated).not.toHaveBeenCalled();
  });
});
