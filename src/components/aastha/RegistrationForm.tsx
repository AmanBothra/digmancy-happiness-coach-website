"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, Phone, Send, ShieldCheck, User } from "lucide-react";
import { REGISTRATION_URL } from "@/lib/registration";

interface RegistrationFormProps {
  variant?: "hero" | "panel";
  ctaLabel?: string;
}

const RegistrationForm = ({
  variant = "hero",
  ctaLabel = "Reserve My Seat Now",
}: RegistrationFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    window.location.href = REGISTRATION_URL;
  };

  const isHero = variant === "hero";

  return (
    <form
      onSubmit={handleSubmit}
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
          Save your seat for <s className="opacity-60 font-normal">₹999</s> ₹99 only
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">Honest. Transformational.</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cta pointer-events-none" />
          <Input
            placeholder="Your full name"
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
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="h-12 pl-10 rounded-xl bg-surface border-border focus-visible:border-cta focus-visible:ring-2 focus-visible:ring-cta/40 focus-visible:ring-offset-0 transition-smooth"
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="cta"
        size="xl"
        className="mt-5 w-full shadow-cta hover:shadow-[0_18px_40px_-10px_hsl(var(--cta)/0.7)] transition-smooth"
        disabled={submitting}
      >
        {submitting ? "Reserving..." : ctaLabel}
        <ArrowRight className="ml-1 h-5 w-5" />
      </Button>

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-cta" />
        Limited Seats · Pure Value
      </p>
    </form>
  );
};

export default RegistrationForm;
