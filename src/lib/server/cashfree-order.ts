import { randomBytes, randomUUID } from "node:crypto";
import { optionalEnv, requiredEnv } from "./env";

const DEFAULT_CASHFREE_API_VERSION = "2025-01-01";

export type CashfreeMode = "sandbox" | "production";

export type CreateCashfreeOrderInput = {
  orderId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  profession: string;
  returnUrl: string;
  notifyUrl?: string;
};

export type CashfreeOrderResponse = {
  cf_order_id?: string;
  order_id: string;
  order_status?: string;
  order_amount?: number;
  order_currency?: string;
  payment_session_id: string;
};

export function createLocalOrderId() {
  return `alc_${Date.now()}_${randomBytes(5).toString("hex")}`;
}

export function getCashfreeMode(): CashfreeMode {
  return getCashfreeClientId().toUpperCase().startsWith("TEST") ? "sandbox" : "production";
}

export async function createCashfreeOrder(input: CreateCashfreeOrderInput) {
  const response = await cashfreeFetch("/orders", {
    method: "POST",
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: input.amount,
      order_currency: input.currency,
      customer_details: {
        customer_id: input.orderId,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
      },
      order_meta: {
        return_url: input.returnUrl,
        notify_url: input.notifyUrl,
      },
      order_note: "Successful on the Outside, Suffocated on the Inside masterclass",
      order_tags: {
        source: "digmancy_website",
        product: "seminar_registration",
        city: input.city,
        profession: input.profession,
      },
    }),
  });

  return response as CashfreeOrderResponse;
}

export async function getCashfreeOrder(orderId: string) {
  return cashfreeFetch(`/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
  });
}

async function cashfreeFetch(path: string, init: RequestInit) {
  const response = await fetch(`${getCashfreeBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-version": getCashfreeApiVersion(),
      "x-client-id": getCashfreeClientId(),
      "x-client-secret": getCashfreeClientSecret(),
      "x-idempotency-key": randomUUID(),
      ...(init.headers || {}),
    },
  });

  const responseText = await response.text();
  const parsed = parseJson(responseText);
  if (!response.ok) {
    const message = readCashfreeError(parsed) || responseText || "Cashfree API request failed";
    throw new Error(message);
  }

  return parsed;
}

function getCashfreeBaseUrl() {
  return getCashfreeMode() === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

function getCashfreeClientId() {
  return optionalEnv("CASHFREE_CLIENT_ID") || optionalEnv("CASHFREE_APP_ID") || requiredEnv("CASHFREE_CLIENT_ID");
}

function getCashfreeClientSecret() {
  return (
    optionalEnv("CASHFREE_CLIENT_SECRET") ||
    optionalEnv("CASHFREE_SECRET_KEY") ||
    optionalEnv("CASHFREE_PG_SECRET_KEY") ||
    requiredEnv("CASHFREE_CLIENT_SECRET")
  );
}

function getCashfreeApiVersion() {
  return optionalEnv("CASHFREE_API_VERSION") || DEFAULT_CASHFREE_API_VERSION;
}

function parseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function readCashfreeError(value: unknown) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const message = record.message || record.error_description || record.error;
  return typeof message === "string" ? message : undefined;
}
