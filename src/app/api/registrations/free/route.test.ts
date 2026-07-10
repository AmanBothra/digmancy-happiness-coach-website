import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createLocalOrderId: vi.fn(() => "alc_test_free_1"),
  createFreeRegistration: vi.fn(),
  dispatchPaidRegistrationNotifications: vi.fn(),
}));

vi.mock("@/lib/server/cashfree-order", () => ({
  createLocalOrderId: mocks.createLocalOrderId,
}));

vi.mock("@/lib/server/cashfree-payment-webhook", () => ({
  dispatchPaidRegistrationNotifications: mocks.dispatchPaidRegistrationNotifications,
}));

vi.mock("@/lib/server/registration-db", () => ({
  createRegistrationDatabase: () => ({
    createFreeRegistration: mocks.createFreeRegistration,
  }),
}));

import { POST } from "./route";

describe("POST /api/registrations/free", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.WEBINAR_START_AT_ISO = "2030-01-06T05:30:00.000Z";
    process.env.WEBINAR_JOINING_LINK = "https://zoom.example.com/join";

    mocks.createFreeRegistration.mockResolvedValue({
      id: "registration_free_1",
      order_id: "alc_test_free_1",
      name: "Aman Bothra",
      email: "aman@example.com",
      mobile: "919999999999",
      amount: 0,
      currency: "INR",
      status: "paid",
    });
    mocks.dispatchPaidRegistrationNotifications.mockResolvedValue({ notificationFailures: [] });
  });

  afterEach(() => {
    delete process.env.WEBINAR_START_AT_ISO;
    delete process.env.WEBINAR_JOINING_LINK;
  });

  it("stores a zero-amount paid registration and runs registration automation", async () => {
    const request = new Request("https://authenticleadershipcircle.com/api/registrations/free", {
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
      registered: true,
      orderId: "alc_test_free_1",
    });
    expect(mocks.createFreeRegistration).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "alc_test_free_1",
        name: "Aman Bothra",
        email: "aman@example.com",
        mobile: "919999999999",
        city: "Kolkata",
        profession: "Founder",
        amount: 0,
        currency: "INR",
        webinarDateLabel: "Sunday 6 January",
        webinarTimeLabel: "11:00 AM IST",
      }),
    );
    expect(mocks.dispatchPaidRegistrationNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        createFreeRegistration: expect.any(Function),
      }),
      expect.objectContaining({
        order_id: "alc_test_free_1",
        status: "paid",
      }),
    );
  });

  it("rejects missing required fields before storing the free registration", async () => {
    const request = new Request("https://authenticleadershipcircle.com/api/registrations/free", {
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
    expect(mocks.createFreeRegistration).not.toHaveBeenCalled();
    expect(mocks.dispatchPaidRegistrationNotifications).not.toHaveBeenCalled();
  });

  it("keeps the registration successful when immediate notification sending fails", async () => {
    mocks.dispatchPaidRegistrationNotifications.mockResolvedValue({
      notificationFailures: ["email"],
    });

    const request = new Request("https://authenticleadershipcircle.com/api/registrations/free", {
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
      registered: true,
      orderId: "alc_test_free_1",
      notificationFailures: ["email"],
    });
  });

  it("keeps the registration successful when notification automation throws", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.dispatchPaidRegistrationNotifications.mockRejectedValue(new Error("smtp failed"));

    try {
      const request = new Request("https://authenticleadershipcircle.com/api/registrations/free", {
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
        registered: true,
        orderId: "alc_test_free_1",
        notificationFailures: ["automation"],
      });
      expect(consoleError).toHaveBeenCalledWith(
        "Free registration notification automation failed",
        expect.any(Error),
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
