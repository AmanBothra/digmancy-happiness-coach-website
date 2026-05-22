import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("Cashfree payment-form webhook route", () => {
  it("rejects invalid webhook signatures before processing the payload", async () => {
    process.env.CASHFREE_PG_SECRET_KEY = "cashfree-secret";
    const request = new Request("https://example.com/api/webhooks/cashfree/payment-form", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-webhook-timestamp": "1746426425612",
        "x-webhook-signature": "invalid",
      },
      body: JSON.stringify({ type: "PAYMENT_FORM_ORDER_WEBHOOK" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "invalid_signature",
    });
  });
});
