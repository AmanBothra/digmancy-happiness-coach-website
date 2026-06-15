import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCashfreeOrder, getCashfreeMode } from "./cashfree-order";

const ORIGINAL_ENV = process.env;

describe("Cashfree order configuration", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            order_id: "alc_test_1",
            payment_session_id: "session_1",
          }),
          { status: 200 },
        ),
      ),
    );

    process.env = {
      ...ORIGINAL_ENV,
      CASHFREE_CLIENT_ID: "TEST110708171073016e45a96347293f71807011",
      CASHFREE_CLIENT_SECRET: "cashfree-secret",
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = ORIGINAL_ENV;
  });

  it("uses sandbox automatically for TEST client ids and sends the required API version header", async () => {
    expect(getCashfreeMode()).toBe("sandbox");

    await createCashfreeOrder({
      orderId: "alc_test_1",
      amount: 99,
      currency: "INR",
      customerName: "Aman",
      customerEmail: "aman@example.com",
      customerPhone: "9999999999",
      returnUrl: "https://example.com/payment-status",
      notifyUrl: "https://example.com/api/webhooks/cashfree/payments",
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://sandbox.cashfree.com/pg/orders",
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-api-version": "2025-01-01",
        }),
      }),
    );
  });

  it("uses production automatically for non-TEST client ids", () => {
    process.env.CASHFREE_CLIENT_ID = "PROD110708171073016e45a96347293f71807011";

    expect(getCashfreeMode()).toBe("production");
  });
});
