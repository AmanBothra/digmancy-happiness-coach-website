"use client";

import Link from "next/link";
import React from "react";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiBasePath } from "@/lib/api-base-path";

type PaymentStatusState =
  | { kind: "loading"; orderId: string }
  | { kind: "paid"; orderId: string }
  | { kind: "pending"; orderId: string }
  | { kind: "failed"; orderId: string; message: string }
  | { kind: "missing" };

export default function PaymentStatusPage() {
  const [status, setStatus] = useState<PaymentStatusState>({ kind: "loading", orderId: "" });

  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get("order_id");
    if (!orderId) {
      setStatus({ kind: "missing" });
      return;
    }

    let ignore = false;
    setStatus({ kind: "loading", orderId });

    async function checkPaymentStatus() {
      try {
        const response = await fetch(
          `${getApiBasePath()}/api/payments/cashfree/status?order_id=${encodeURIComponent(orderId)}`,
          { cache: "no-store" },
        );
        const payload = (await response.json().catch(() => null)) as PaymentStatusResponse | null;

        if (ignore) {
          return;
        }

        if (!response.ok || !payload?.ok) {
          setStatus({
            kind: "failed",
            orderId,
            message:
              payload?.message ||
              "We could not confirm this payment yet. Please contact support if the amount was debited.",
          });
          return;
        }

        setStatus(payload.status === "paid" ? { kind: "paid", orderId } : { kind: "pending", orderId });
      } catch {
        if (!ignore) {
          setStatus({
            kind: "failed",
            orderId,
            message:
              "We could not confirm this payment yet. Please contact support if the amount was debited.",
          });
        }
      }
    }

    void checkPaymentStatus();

    return () => {
      ignore = true;
    };
  }, []);

  const view = getPaymentStatusView(status);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container flex min-h-screen max-w-2xl flex-col items-center justify-center py-20 text-center">
        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${view.iconClass}`}>
          {view.icon}
        </div>
        <h1 className="mt-6 font-serif text-4xl font-bold text-primary">
          {view.title}
        </h1>
        <p className="mt-4 text-muted-foreground whitespace-pre-line">{view.message}</p>
        <Button asChild variant="cta" size="lg" className="mt-8">
          <Link href="/">Back to masterclass page</Link>
        </Button>
      </section>
    </main>
  );
}

type PaymentStatusResponse = {
  ok: boolean;
  status?: string | null;
  message?: string;
};

function getPaymentStatusView(status: PaymentStatusState) {
  switch (status.kind) {
    case "paid":
      return {
        title: "Thank you for registering for the masterclass.",
        message: "Check your registered WhatsApp number and Email for further details.",
        iconClass: "bg-cta text-primary shadow-cta",
        icon: <CheckCircle2 className="h-8 w-8" />,
      };
    case "pending":
      return {
        title: "Payment is being verified",
        message:
          "We have received your payment return and are waiting for confirmation from Cashfree. Please refresh this page in a minute.",
        iconClass: "bg-cta text-primary shadow-cta",
        icon: <Loader2 className="h-8 w-8 animate-spin" />,
      };
    case "failed":
      return {
        title: "Payment status unavailable",
        message: status.message,
        iconClass: "bg-destructive/10 text-destructive",
        icon: <XCircle className="h-8 w-8" />,
      };
    case "missing":
      return {
        title: "Order not found",
        message: "We could not find an order reference in the payment return URL.",
        iconClass: "bg-destructive/10 text-destructive",
        icon: <XCircle className="h-8 w-8" />,
      };
    case "loading":
    default:
      return {
        title: "Confirming your payment...",
        message: "Please wait while we verify the payment with Cashfree.",
        iconClass: "bg-cta text-primary shadow-cta",
        icon: <Loader2 className="h-8 w-8 animate-spin" />,
      };
  }
}
