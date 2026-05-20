import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyCashfreeWebhookSignature } from "./cashfree";

describe("verifyCashfreeWebhookSignature", () => {
  it("accepts Cashfree signatures generated from timestamp plus raw body", () => {
    const timestamp = "1746426425612";
    const rawBody = JSON.stringify({ type: "PAYMENT_FORM_ORDER_WEBHOOK" });
    const secret = "cashfree-secret";
    const signature = createHmac("sha256", secret)
      .update(timestamp + rawBody)
      .digest("base64");

    expect(
      verifyCashfreeWebhookSignature({ timestamp, rawBody, signature, secret }),
    ).toBe(true);
  });

  it("rejects signatures that do not match the unmodified raw body", () => {
    expect(
      verifyCashfreeWebhookSignature({
        timestamp: "1746426425612",
        rawBody: "{\"type\":\"PAYMENT_FORM_ORDER_WEBHOOK\"}",
        signature: "invalid",
        secret: "cashfree-secret",
      }),
    ).toBe(false);
  });
});
