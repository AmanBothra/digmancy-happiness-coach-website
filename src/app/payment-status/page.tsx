"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentStatusPage() {
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    setOrderId(new URLSearchParams(window.location.search).get("order_id"));
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container flex min-h-screen max-w-2xl flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cta text-primary shadow-cta">
          {orderId ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
        </div>
        <h1 className="mt-6 font-serif text-4xl font-bold text-primary">
          {orderId ? "Payment status is being confirmed" : "Order not found"}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {orderId
            ? "If your payment was successful, your confirmation email and WhatsApp message will be sent as soon as Cashfree confirms the payment webhook."
            : "We could not find an order reference in the payment return URL."}
        </p>
        {orderId && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-cta" />
            Order ID: {orderId}
          </p>
        )}
        <Button asChild variant="cta" size="lg" className="mt-8">
          <Link href="/">Back to masterclass page</Link>
        </Button>
      </section>
    </main>
  );
}
