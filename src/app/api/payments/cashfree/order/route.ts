import { NextResponse } from "next/server";
import {
  createCashfreeOrder,
  createLocalOrderId,
  getCashfreeMode,
} from "@/lib/server/cashfree-order";
import { createRegistrationDatabase } from "@/lib/server/registration-db";
import { getBackendBaseUrl, getFrontendBaseUrl } from "@/lib/server/url";
import { getWebinarDetails } from "@/lib/server/webinar";
import { getRegistrationPrice } from "@/lib/registration-price";
import { validateRegistrationInput } from "@/lib/server/registration-input";

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
