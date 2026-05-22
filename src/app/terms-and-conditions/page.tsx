"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/aastha-logo.png";

const TermsAndConditions = () => {
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
          Terms &amp; Conditions
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <div className="prose prose-neutral mt-10 max-w-none text-foreground/80 leading-relaxed space-y-6">
          <p>
            Welcome to Authentic Leadership Circle (“ALC”, “we”, “our”, “us”).
          </p>
          <p>
            By accessing this website, registering for our masterclasses, workshops,
            coaching programs, memberships, community experiences, or any related
            services, you agree to the following Terms &amp; Conditions.
          </p>

          <h2 className="font-serif text-2xl font-bold text-primary">1. Use of Website &amp; Services</h2>
          <p>
            The content, programs, and services offered through this website are
            intended for personal learning, leadership development, and growth
            purposes only.
          </p>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>misuse the website or its content</li>
            <li>reproduce, copy, or distribute materials without permission</li>
            <li>disrupt or interfere with website functionality</li>
          </ul>

          <h2 className="font-serif text-2xl font-bold text-primary">2. Intellectual Property</h2>
          <p>
            All content including videos, frameworks, text, graphics, branding,
            session material, and resources shared through Authentic Leadership
            Circle are the intellectual property of ALC unless otherwise stated.
          </p>
          <p>
            You may not reproduce, republish, or commercially use any material
            without prior written permission.
          </p>

          <h2 className="font-serif text-2xl font-bold text-primary">3. Payments</h2>
          <p>
            Payments made for programs, events, masterclasses, coaching sessions,
            memberships, or other offerings must be completed through approved
            payment methods listed on the website.
          </p>
          <p>Prices are subject to change at any time without prior notice.</p>

          <h2 className="font-serif text-2xl font-bold text-primary">4. Participant Responsibility</h2>
          <p>
            Our programs are designed for education, reflection, leadership
            growth, and personal development.
          </p>
          <p>
            Results may vary from person to person based on participation,
            implementation, and individual circumstances.
          </p>

          <h2 className="font-serif text-2xl font-bold text-primary">5. Communication</h2>
          <p>
            By registering on our website or for any offering, you consent to
            receive relevant communication related to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>registrations</li>
            <li>reminders</li>
            <li>updates</li>
            <li>resources</li>
            <li>future offerings</li>
          </ul>
          <p>You may unsubscribe from promotional communication at any time.</p>

          <h2 className="font-serif text-2xl font-bold text-primary">6. Limitation of Liability</h2>
          <p>
            Authentic Leadership Circle shall not be held liable for any direct,
            indirect, incidental, or consequential damages arising from the use of
            this website, participation in programs, or reliance on any content
            shared.
          </p>

          <h2 className="font-serif text-2xl font-bold text-primary">7. Modifications</h2>
          <p>
            We reserve the right to modify these Terms &amp; Conditions at any
            time. Updated versions will be posted on this website.
          </p>

          <h2 className="font-serif text-2xl font-bold text-primary">8. Governing Law</h2>
          <p>
            These Terms &amp; Conditions shall be governed in accordance with the
            laws of India.
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

export default TermsAndConditions;
