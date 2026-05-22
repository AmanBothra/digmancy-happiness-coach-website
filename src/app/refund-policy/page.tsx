"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/aastha-logo.png";

const RefundPolicy = () => {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <header className="border-b border-border bg-background">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src={logo.src} alt="AASTHA" className="h-10 w-10 object-contain" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-glow transition-smooth"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>
      </header>

      <section className="container max-w-3xl py-14 lg:py-20">
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-primary">
          Refund Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <div className="prose prose-neutral mt-10 max-w-none text-foreground/80 leading-relaxed space-y-6">
          <p>
            At Authentic Leadership Circle, we value the commitment and energy that
            participants bring into our programs and experiences.
          </p>

          <h2 className="font-serif text-2xl font-bold text-primary">1. Masterclasses &amp; Events</h2>
          <p>
            Unless otherwise stated on the registration page, all registrations for
            masterclasses, workshops, and live events are non-refundable.
          </p>
          <p>
            However, in exceptional situations, transfer requests may be considered
            at our discretion.
          </p>

          <h2 className="font-serif text-2xl font-bold text-primary">2. Coaching Programs &amp; Memberships</h2>
          <p>
            Participants may request a refund within 7 days from the date of
            purchase for eligible coaching programs, memberships, or digital
            offerings, unless otherwise stated on the respective sales page.
          </p>
          <p>
            Refund requests will be reviewed on a case-by-case basis and may only
            be considered if a genuine and valid reason is provided.
          </p>
          <p>Refunds may not be granted in situations where:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              substantial portions of the program or course content have already
              been accessed, consumed, downloaded, or completed,
            </li>
            <li>
              program resources or downloadable materials have been accessed or
              retained,
            </li>
            <li>
              live coaching or onboarding sessions have already been attended,
            </li>
            <li>
              the request is based solely on a change of mind, lack of time, or
              failure to participate.
            </li>
          </ul>
          <p>
            Authentic Leadership Circle reserves the right to determine refund
            eligibility at its sole discretion.
          </p>
          <p>
            Approved refunds, if any, will be processed within 7-10 days through
            the original mode of payment.
          </p>

          <h2 className="font-serif text-2xl font-bold text-primary">3. Missed Sessions</h2>
          <p>
            Failure to attend a live session, workshop, or event does not qualify
            for a refund.
          </p>

          <h2 className="font-serif text-2xl font-bold text-primary">4. Technical Issues</h2>
          <p>
            Participants are responsible for ensuring they have adequate internet
            connectivity and access to the required platforms for online sessions.
          </p>

          <h2 className="font-serif text-2xl font-bold text-primary">5. Cancellation by Us</h2>
          <p>
            If an event or session is cancelled by Authentic Leadership Circle,
            participants may be offered:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>a rescheduled session,</li>
            <li>credit toward a future offering, or</li>
            <li>a full or partial refund, depending on the situation.</li>
          </ul>

          <h2 className="font-serif text-2xl font-bold text-primary">6. Contact</h2>
          <p>
            For refund-related queries, participants may contact us at{" "}
            <a
              href="mailto:connect@authenticleadershipcircle.com"
              className="text-primary underline"
            >
              connect@authenticleadershipcircle.com
            </a>
            .
          </p>
        </div>
      </section>

      <footer className="py-10 border-t border-border bg-background">
        <div className="container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Aastha Tatia · Authentic Leadership Circle
        </div>
      </footer>
    </main>
  );
};

export default RefundPolicy;
