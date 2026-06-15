import { optionalEnv } from "./env";
import { normalizeIndianMobile } from "./phone";

const DEFAULT_WHATSAPP_API_URL =
  "http://209.182.233.106:7545/api/admin/whatsapp/send-message";
const DEFAULT_WHATSAPP_INSTANCE_ID = "website";
const DEFAULT_WHATSAPP_AUTH_HEADER = "Authorization";
const DEFAULT_WHATSAPP_AUTH_SCHEME = "Bearer";

export type WhatsAppMessageInput = {
  to: string;
  message: string;
  name?: string | null;
  templateKey: string;
};

export type WhatsAppSendResult = {
  messageId?: string;
  skipped?: boolean;
  error?: string;
};

export async function sendWhatsappMessage({
  to,
  message,
}: WhatsAppMessageInput): Promise<WhatsAppSendResult> {
  const normalizedTo = normalizeIndianMobile(to);
  if (!normalizedTo) {
    throw new Error("WhatsApp recipient must be a valid Indian mobile number");
  }

  const apiUrl = buildWhatsappApiUrl(
    optionalEnv("WHATSAPP_API_URL") || DEFAULT_WHATSAPP_API_URL,
    optionalEnv("WHATSAPP_INSTANCE_ID") || DEFAULT_WHATSAPP_INSTANCE_ID,
  );
  const apiKey = optionalEnv("WHATSAPP_API_KEY");

  if (!apiUrl || !apiKey) {
    return {
      skipped: true,
      error: "WhatsApp API is not configured",
    };
  }

  const authHeader = process.env.WHATSAPP_API_AUTH_HEADER || DEFAULT_WHATSAPP_AUTH_HEADER;
  const authScheme = process.env.WHATSAPP_API_AUTH_SCHEME || DEFAULT_WHATSAPP_AUTH_SCHEME;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    [authHeader]: authScheme ? `${authScheme} ${apiKey}` : apiKey,
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      to: normalizedTo,
      message,
    }),
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(responseText || `WhatsApp API failed with ${response.status}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    parsed = undefined;
  }

  return {
    messageId: readProviderMessageId(parsed),
  };
}

function readProviderMessageId(value: unknown) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const id = record.id || record.message_id || record.messageId;
  if (typeof id === "string") {
    return id;
  }

  const data = record.data;
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const nestedId = (data as Record<string, unknown>).messageId;
  return typeof nestedId === "string" ? nestedId : undefined;
}

function buildWhatsappApiUrl(apiUrl?: string, instanceId?: string) {
  if (!apiUrl || !instanceId || apiUrl.includes("instanceId=")) {
    return apiUrl;
  }

  const separator = apiUrl.includes("?") ? "&" : "?";
  return `${apiUrl}${separator}instanceId=${encodeURIComponent(instanceId)}`;
}
