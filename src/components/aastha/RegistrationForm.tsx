"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiBasePath } from "@/lib/api-base-path";
import {
  getRegistrationCompareAtPriceLabel,
  getRegistrationPriceLabel,
} from "@/lib/registration-price";
import { trackRegisterButtonClick, trackRegistrationLead } from "@/lib/meta-pixel";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

interface RegistrationFormProps {
  variant?: "hero" | "panel";
  ctaLabel?: string;
  mode?: "paid" | "free";
}

const RegistrationForm = ({
  variant = "hero",
  ctaLabel,
  mode = "paid",
}: RegistrationFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    profession: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`${getApiBasePath()}${getRegistrationEndpoint(mode)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          mobile: form.phone,
          city: form.city,
          profession: form.profession,
        }),
      });
      const payload = (await response.json()) as RegistrationResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.message ||
            payload.error ||
            (mode === "free"
              ? "We could not complete your registration. Please try again."
              : "We could not start the payment. Please try again."),
        );
      }

      trackRegistrationLead();

      if (mode === "free") {
        const orderId = payload.orderId ? `?order_id=${encodeURIComponent(payload.orderId)}` : "";
        window.location.assign(`/free/thank-you${orderId}`);
        return;
      }

      const cashfreePayload = payload as CashfreeOrderResponse;
      if (!cashfreePayload.paymentSessionId || !cashfreePayload.cashfreeMode) {
        throw new Error("Payment session was not returned by the server.");
      }

      const cashfree = await loadCashfree(cashfreePayload.cashfreeMode);
      await cashfree.checkout({
        paymentSessionId: cashfreePayload.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : mode === "free"
            ? "Registration could not be completed."
            : "Payment could not be started.",
      );
      setSubmitting(false);
    }
  };

  const isHero = variant === "hero";
  const registrationPrice = getRegistrationPriceLabel();
  const compareAtPrice = getRegistrationCompareAtPriceLabel();
  const submitLabel =
    ctaLabel || (mode === "free" ? "Register Free" : `Continue to ${registrationPrice} Payment`);
  const title =
    mode === "free" ? (
      <>Save your seat for the masterclass</>
    ) : (
      <>
        Save your seat for <s className="opacity-60 font-normal">{compareAtPrice}</s>{" "}
        {registrationPrice} only
      </>
    );

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="registration-form"
      className={`relative w-full rounded-2xl p-6 sm:p-7 ${
        isHero
          ? "bg-white/95 backdrop-blur-md shadow-elegant border border-white/40"
          : "bg-card shadow-elegant border-2 border-cta/40"
      }`}
    >
      {/* yellow corner accent */}
      <span aria-hidden className="absolute -top-1 left-6 right-6 h-1 rounded-full bg-cta" />

      <div className="text-center mb-5">
        <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary bg-cta/30 px-3 py-1 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-cta animate-pulse-soft" />
          Live · Limited Seats
        </span>
        <h3 className="mt-3 font-serif text-2xl sm:text-[26px] font-bold text-primary leading-tight">
          {title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">Honest. Transformational.</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cta pointer-events-none" />
          <Input
            placeholder="Your full name"
            required
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="h-12 pl-10 rounded-xl bg-surface border-border focus-visible:border-cta focus-visible:ring-2 focus-visible:ring-cta/40 focus-visible:ring-offset-0 transition-smooth"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cta pointer-events-none" />
          <Input
            type="email"
            placeholder="Email address"
            required
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="h-12 pl-10 rounded-xl bg-surface border-border focus-visible:border-cta focus-visible:ring-2 focus-visible:ring-cta/40 focus-visible:ring-offset-0 transition-smooth"
          />
        </div>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cta pointer-events-none" />
          <Input
            type="tel"
            placeholder="WhatsApp number"
            required
            name="mobile"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="h-12 pl-10 rounded-xl bg-surface border-border focus-visible:border-cta focus-visible:ring-2 focus-visible:ring-cta/40 focus-visible:ring-offset-0 transition-smooth"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cta pointer-events-none" />
          <Input
            placeholder="City"
            required
            name="city"
            autoComplete="address-level2"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="h-12 pl-10 rounded-xl bg-surface border-border focus-visible:border-cta focus-visible:ring-2 focus-visible:ring-cta/40 focus-visible:ring-offset-0 transition-smooth"
          />
        </div>
        <div className="relative">
          <BriefcaseBusiness className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cta pointer-events-none" />
          <Input
            placeholder="Profession"
            required
            name="profession"
            autoComplete="organization-title"
            value={form.profession}
            onChange={(e) => setForm({ ...form, profession: e.target.value })}
            className="h-12 pl-10 rounded-xl bg-surface border-border focus-visible:border-cta focus-visible:ring-2 focus-visible:ring-cta/40 focus-visible:ring-offset-0 transition-smooth"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      <Button
        type="submit"
        variant="cta"
        size="xl"
        className="mt-5 w-full shadow-cta hover:shadow-[0_18px_40px_-10px_hsl(var(--cta)/0.7)] transition-smooth"
        disabled={submitting}
        onClick={trackRegisterButtonClick}
      >
        {submitting
          ? mode === "free"
            ? "Registering..."
            : "Opening secure payment..."
          : submitLabel}
        {mode === "paid" && <ArrowRight className="ml-1 h-5 w-5" />}
      </Button>

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-cta" />
        Limited Seats · Pure Value
      </p>
    </form>
  );
};

export default RegistrationForm;

type CashfreeOrderResponse =
  {
    ok: boolean;
    orderId?: string;
    paymentSessionId?: string;
    cashfreeMode?: "sandbox" | "production";
    error?: string;
    message?: string;
  };

type FreeRegistrationResponse = {
  ok: boolean;
  registered?: boolean;
  orderId?: string;
  error?: string;
  message?: string;
};

type RegistrationResponse = CashfreeOrderResponse | FreeRegistrationResponse;

function getRegistrationEndpoint(mode: "paid" | "free") {
  return mode === "free" ? "/api/registrations/free" : "/api/payments/cashfree/order";
}

type CashfreeCheckout = {
  checkout: (options: {
    paymentSessionId: string;
    redirectTarget: "_self" | "_blank" | "_top" | "_modal";
  }) => Promise<unknown> | void;
};

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => CashfreeCheckout;
  }
}

async function loadCashfree(mode: "sandbox" | "production") {
  if (!window.Cashfree) {
    await loadScript("https://sdk.cashfree.com/js/v3/cashfree.js");
  }

  if (!window.Cashfree) {
    throw new Error("Cashfree checkout could not be loaded.");
  }

  return window.Cashfree({ mode });
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Cashfree checkout script failed to load."));
    document.head.appendChild(script);
  });
}
