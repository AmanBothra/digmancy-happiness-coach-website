import { NextResponse } from "next/server";
import { createLocalOrderId } from "@/lib/server/cashfree-order";
import { dispatchPaidRegistrationNotifications } from "@/lib/server/cashfree-payment-webhook";
import { createRegistrationDatabase } from "@/lib/server/registration-db";
import { validateRegistrationInput } from "@/lib/server/registration-input";
import { getWebinarDetails } from "@/lib/server/webinar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REGISTRATION_CURRENCY = "INR";
const FREE_REGISTRATION_AMOUNT = 0;

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

  const db = createRegistrationDatabase();
  const webinar = getWebinarDetails();
  const orderId = createLocalOrderId();

  try {
    const registration = await db.createFreeRegistration({
      orderId,
      name: validation.value.name,
      email: validation.value.email,
      mobile: validation.value.mobile,
      city: validation.value.city,
      profession: validation.value.profession,
      amount: FREE_REGISTRATION_AMOUNT,
      currency: REGISTRATION_CURRENCY,
      webinarStartAt: webinar.startAt,
      webinarDateLabel: webinar.dateLabel,
      webinarTimeLabel: webinar.timeLabel,
      joiningLink: webinar.joiningLink,
    });

    const { notificationFailures } = await dispatchPaidRegistrationNotifications(db, registration);

    if (notificationFailures.length) {
      return NextResponse.json(
        {
          ok: false,
          registered: true,
          orderId,
          error: "notification_send_failed",
          notificationFailures,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, registered: true, orderId });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "free_registration_failed", message: errorMessage(error) },
      { status: 500 },
    );
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown registration error";
}
