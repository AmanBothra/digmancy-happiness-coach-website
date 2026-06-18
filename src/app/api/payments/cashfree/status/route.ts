import { NextResponse } from "next/server";
import { getCashfreeOrder } from "@/lib/server/cashfree-order";
import { reconcileCashfreeOrderPayment } from "@/lib/server/cashfree-payment-webhook";
import { createRegistrationDatabase } from "@/lib/server/registration-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const orderId = new URL(request.url).searchParams.get("order_id")?.trim();
  if (!orderId) {
    return NextResponse.json({ ok: false, error: "missing_order_id" }, { status: 400 });
  }

  const db = createRegistrationDatabase();
  let registration = await db.getRegistrationByOrderId(orderId);
  if (!registration) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (registration.status !== "paid") {
    try {
      const cashfreeOrder = await getCashfreeOrder(orderId);
      const reconciled = await reconcileCashfreeOrderPayment({
        orderId,
        cashfreeOrder,
        db,
      });

      if (reconciled.registration) {
        registration = reconciled.registration;
      }
    } catch (error) {
      console.warn("Cashfree status reconciliation failed", error);
      // Keep the customer-facing status endpoint available even if Cashfree reconciliation is delayed.
    }
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
