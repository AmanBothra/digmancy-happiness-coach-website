import { NextResponse } from "next/server";
import {
  createCashfreeOrder,
  createLocalOrderId,
  getCashfreeMode,
} from "@/lib/server/cashfree-order";
import { createRegistrationDatabase } from "@/lib/server/registration-db";
import { getBackendBaseUrl, getFrontendBaseUrl } from "@/lib/server/url";
import { getWebinarDetails } from "@/lib/server/webinar";
import { normalizeIndianMobile } from "@/lib/server/phone";
import { getRegistrationPrice } from "@/lib/registration-price";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REGISTRATION_CURRENCY = "INR";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const validation = validateRegistrationInput(body);
  if (validation.ok === false) {
    return NextResponse.json(
      { ok: false, error: "invalid_registration", fields: validation.fields },
      { status: 400 },
    );
  }

  const frontendBaseUrl = getFrontendBaseUrl(request);
  const backendBaseUrl = getBackendBaseUrl(request);
  const orderId = createLocalOrderId();
  const webinar = getWebinarDetails();
  const db = createRegistrationDatabase();
  const amount = getRegistrationPrice().amount;

  try {
    await db.createPendingRegistration({
      orderId,
      name: validation.value.name,
      email: validation.value.email,
      mobile: validation.value.mobile,
      city: validation.value.city,
      profession: validation.value.profession,
      amount,
      currency: REGISTRATION_CURRENCY,
      webinarStartAt: webinar.startAt,
      webinarDateLabel: webinar.dateLabel,
      webinarTimeLabel: webinar.timeLabel,
      joiningLink: webinar.joiningLink,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "registration_storage_failed", message: errorMessage(error) },
      { status: 500 },
    );
  }

  let cashfreeOrder: Awaited<ReturnType<typeof createCashfreeOrder>>;
  try {
    cashfreeOrder = await createCashfreeOrder({
      orderId,
      amount,
      currency: REGISTRATION_CURRENCY,
      customerName: validation.value.name,
      customerEmail: validation.value.email,
      customerPhone: validation.value.mobile,
      city: validation.value.city,
      profession: validation.value.profession,
      returnUrl: `${frontendBaseUrl}/payment-status?order_id=${encodeURIComponent(orderId)}`,
      notifyUrl: `${backendBaseUrl}/api/webhooks/cashfree/payments`,
    });

    if (!cashfreeOrder.payment_session_id) {
      throw new Error("Cashfree did not return a payment_session_id");
    }
  } catch (error) {
    await markOrderCreationFailedSafely(db, orderId, errorMessage(error));
    return NextResponse.json(
      { ok: false, error: "cashfree_order_failed", message: errorMessage(error) },
      { status: 502 },
    );
  }

  try {
    await db.recordOrderCreated({
      orderId,
      cfOrderId: cashfreeOrder.cf_order_id,
      paymentSessionId: cashfreeOrder.payment_session_id,
      orderStatus: cashfreeOrder.order_status,
      rawResponse: cashfreeOrder,
    });

    return NextResponse.json({
      ok: true,
      orderId,
      paymentSessionId: cashfreeOrder.payment_session_id,
      cashfreeMode: getCashfreeMode(),
    });
  } catch (error) {
    await markOrderCreationFailedSafely(db, orderId, errorMessage(error));
    return NextResponse.json(
      { ok: false, error: "registration_storage_failed", message: errorMessage(error) },
      { status: 500 },
    );
  }
}

type RegistrationInput = {
  name: string;
  email: string;
  mobile: string;
  city: string;
  profession: string;
};

type ValidationResult =
  | { ok: true; value: RegistrationInput }
  | { ok: false; fields: Partial<Record<keyof RegistrationInput, string>> };

function validateRegistrationInput(value: unknown): ValidationResult {
  if (!value || typeof value !== "object") {
    return {
      ok: false,
      fields: {
        name: "Name is required",
        email: "Email is required",
        mobile: "Mobile number is required",
        city: "City is required",
        profession: "Profession is required",
      },
    };
  }

  const record = value as Record<string, unknown>;
  const name = normalizeText(record.name);
  const email = normalizeText(record.email).toLowerCase();
  const mobile = normalizePhone(record.mobile);
  const city = normalizeText(record.city);
  const profession = normalizeText(record.profession);
  const fields: Partial<Record<keyof RegistrationInput, string>> = {};

  if (!name) {
    fields.name = "Name is required";
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fields.email = "Enter a valid email";
  }
  if (!mobile) {
    fields.mobile = "Enter a valid WhatsApp number";
  }
  if (!city) {
    fields.city = "City is required";
  }
  if (!profession) {
    fields.profession = "Profession is required";
  }

  if (Object.keys(fields).length) {
    return { ok: false, fields };
  }

  return { ok: true, value: { name, email, mobile, city, profession } };
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePhone(value: unknown) {
  return normalizeIndianMobile(value);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Cashfree error";
}

async function markOrderCreationFailedSafely(
  db: ReturnType<typeof createRegistrationDatabase>,
  orderId: string,
  message: string,
) {
  try {
    await db.markOrderCreationFailed(orderId, message);
  } catch {
    // Keep the customer-facing error tied to the original failure.
  }
}
