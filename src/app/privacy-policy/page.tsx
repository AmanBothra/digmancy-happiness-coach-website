import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/aastha-logo.png";

const PrivacyPolicy = () => {
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
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <div className="prose prose-neutral mt-10 max-w-none text-foreground/80 leading-relaxed space-y-6">
          <p>
            Authentic Leadership Circle (“ALC”, “we”, “our”, “us”) respects your
            privacy and is committed to protecting your personal information.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, and safeguard your
            information when you interact with our website, programs, masterclasses,
            memberships, coaching services, and related offerings.
          </p>

          <h2 className="font-serif text-2xl font-bold text-primary">1. Information We Collect</h2>
          <p>We may collect information including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>name</li>
            <li>email address</li>
            <li>phone number</li>
            <li>payment-related details</li>
            <li>responses shared through forms or registrations</li>
          </ul>

          <h2 className="font-serif text-2xl font-bold text-primary">2. How We Use Your Information</h2>
          <p>Your information may be used to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>process registrations and payments</li>
            <li>send session details and updates</li>
            <li>provide access to programs or resources</li>
            <li>improve our offerings and user experience</li>
            <li>share relevant future offerings, events, or community updates</li>
          </ul>

          <h2 className="font-serif text-2xl font-bold text-primary">3. Data Protection</h2>
          <p>
            We take reasonable measures to protect your personal information and
            prevent unauthorized access, misuse, or disclosure.
          </p>

          <h2 className="font-serif text-2xl font-bold text-primary">4. Sharing of Information</h2>
          <p>We do not sell or rent your personal information to third parties.</p>
          <p>
            Your information may only be shared with trusted service providers or
            platforms necessary for payment processing, communication, website
            hosting, or program delivery.
          </p>

          <h2 className="font-serif text-2xl font-bold text-primary">5. Cookies &amp; Analytics</h2>
          <p>
            Our website may use cookies or analytics tools to improve user
            experience and understand website usage patterns.
          </p>

          <h2 className="font-serif text-2xl font-bold text-primary">6. External Links</h2>
          <p>
            Our website may contain links to external platforms or third-party
            websites. We are not responsible for their privacy practices or
            content.
          </p>

          <h2 className="font-serif text-2xl font-bold text-primary">7. Your Consent</h2>
          <p>
            By using this website or registering for our offerings, you consent to
            this Privacy Policy.
          </p>

          <h2 className="font-serif text-2xl font-bold text-primary">8. Policy Updates</h2>
          <p>
            We may update this Privacy Policy from time to time. Revised versions
            will be posted on this page.
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

export default PrivacyPolicy;
