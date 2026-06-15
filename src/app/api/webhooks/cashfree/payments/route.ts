import { NextResponse } from "next/server";
import { verifyCashfreeWebhookSignature } from "@/lib/server/cashfree";
import {
  type CashfreePaymentWebhookPayload,
  handleCashfreePaymentWebhook,
} from "@/lib/server/cashfree-payment-webhook";
import { createRegistrationDatabase } from "@/lib/server/registration-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const timestamp = request.headers.get("x-webhook-timestamp");
  const signature = request.headers.get("x-webhook-signature");
  const secret =
    process.env.CASHFREE_CLIENT_SECRET ||
    process.env.CASHFREE_SECRET_KEY ||
    process.env.CASHFREE_PG_SECRET_KEY;

  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "cashfree_secret_not_configured" },
      { status: 500 },
    );
  }

  const isValidSignature = verifyCashfreeWebhookSignature({
    timestamp,
    rawBody,
    signature,
    secret,
  });

  if (!isValidSignature) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!isRecord(payload)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const result = await handleCashfreePaymentWebhook({
    payload: payload as CashfreePaymentWebhookPayload,
    rawPayload: rawBody,
    db: createRegistrationDatabase(),
  });

  return NextResponse.json(result.body, { status: result.status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
