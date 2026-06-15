import { NextResponse } from "next/server";
import { createRegistrationDatabase } from "@/lib/server/registration-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const orderId = new URL(request.url).searchParams.get("order_id")?.trim();
  if (!orderId) {
    return NextResponse.json({ ok: false, error: "missing_order_id" }, { status: 400 });
  }

  const registration = await createRegistrationDatabase().getRegistrationByOrderId(orderId);
  if (!registration) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    orderId: registration.order_id,
    status: registration.status,
    paymentStatus: registration.cashfree_payment_status,
    orderStatus: registration.cashfree_order_status,
    paidAt: registration.paid_at,
  });
}
