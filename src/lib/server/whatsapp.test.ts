import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendWhatsappMessage } from "./whatsapp";

describe("sendWhatsappMessage", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = {
      ...originalEnv,
      WHATSAPP_API_URL:
        "http://209.182.233.106:7545/api/admin/whatsapp/send-message?instanceId=website",
      WHATSAPP_API_KEY: "jwt-token",
      WHATSAPP_API_AUTH_HEADER: "Authorization",
      WHATSAPP_API_AUTH_SCHEME: "Bearer",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  it("posts the provider payload with bearer authentication", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message_id: "wa-1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendWhatsappMessage({
      to: "919999999999",
      message: "Hello from the API!",
      name: "Ignored",
      templateKey: "payment_confirmation",
    });

    expect(result).toEqual({ messageId: "wa-1" });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://209.182.233.106:7545/api/admin/whatsapp/send-message?instanceId=website",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer jwt-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "919999999999",
          message: "Hello from the API!",
        }),
      },
    );
  });

  it("adds country code 91 before sending to the WhatsApp provider", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message_id: "wa-1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await sendWhatsappMessage({
      to: "7976744549",
      message: "Hello from the API!",
      templateKey: "payment_confirmation",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          to: "917976744549",
          message: "Hello from the API!",
        }),
      }),
    );
  });

  it("reads the provider message id from the nested response data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: true,
            data: {
              messageId: "3EB01B72E1A154E57EBEAE",
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    );

    const result = await sendWhatsappMessage({
      to: "917976744549",
      message: "Hello from the API!",
      templateKey: "payment_confirmation",
    });

    expect(result).toEqual({ messageId: "3EB01B72E1A154E57EBEAE" });
  });

  it("fails when the provider returns an unsuccessful JSON body with HTTP 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: false,
            statuscode: 200,
            operation: "Instance is not connected",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    );

    await expect(
      sendWhatsappMessage({
        to: "917976744549",
        message: "Hello from the API!",
        templateKey: "payment_confirmation",
      }),
    ).rejects.toThrow("Instance is not connected");
  });
});
