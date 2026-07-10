"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FreeThankYouPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container flex min-h-screen max-w-2xl flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cta text-primary shadow-cta">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-serif text-4xl font-bold text-primary">
          Thank you for registering for the masterclass.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Check your registered WhatsApp number and Email for further details.
        </p>
        <Button asChild variant="cta" size="lg" className="mt-8">
          <Link href="/masterclass">Back to masterclass page</Link>
        </Button>
      </section>
    </main>
  );
}
