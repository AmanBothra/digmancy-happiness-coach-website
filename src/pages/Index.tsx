import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Eye,
  EyeOff,
  Flame,
  Gift,
  HandHeart,
  Heart,
  HelpCircle,
  Key,
  Mic,
  MicOff,
  Minus,
  Play,
  Plus,
  Quote,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

import logo from "@/assets/aastha-logo.png";
import portrait from "@/assets/aastha-portrait-new.jpg";
import heroPortrait from "@/assets/aastha-hero.jpg";
import videoPreview from "@/assets/video-preview-new.jpg";

import Countdown from "@/components/aastha/Countdown";
import RegistrationForm from "@/components/aastha/RegistrationForm";
import SectionDivider from "@/components/aastha/SectionDivider";
import bonusProductive from "@/assets/bonus-productive-day.jpg";
import bonusJournal from "@/assets/bonus-happiness-journal.jpg";

const Index = () => {
  const autoplayPlugin = useRef(Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true }));
  // Webinar date: next Saturday at 11:00 AM IST
  const webinarDate = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = (6 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    d.setHours(11, 0, 0, 0);
    return d;
  }, []);

  const dateLabel = webinarDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const scrollToRegister = () => {
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
  };

  const [videoPlaying, setVideoPlaying] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const toggleSecret = (i: number) =>
    setRevealed((r) => ({ ...r, [i]: !r[i] }));

  const forYou = [
    "You're a business leader, founder, or corporate leader",
    "You're successful — but something feels internally off",
    "You struggle to say what you really think in important moments",
    "You avoid difficult conversations — even when you know they matter",
    "Your team listens, but doesn't fully take ownership",
    "You feel lonely in your role and can't openly share it",
    "You're tired of pretending everything is okay",
    "You wonder if it is possible to be successful and happy",
    "You want to feel free",
    "You want your leadership to feel meaningful — not just impressive",
  ];

  const secrets = [
    {
      n: "I",
      hook: "Silence is not a personality trait —",
      reveal: "it is a survival pattern.",
      copy: "You'll understand why you've learned to hold back your voice. And how that pattern, once useful, is now limiting your leadership.",
    },
    {
      n: "II",
      hook: "Power is not lost through truth —",
      reveal: "it is built through emotional authority.",
      copy: "You'll see how real influence doesn't come from control. But from presence, honesty, and emotional ownership.",
    },
    {
      n: "III",
      hook: "Voice is not found through thinking —",
      reveal: "it is reclaimed through practice in safe spaces.",
      copy: "You'll discover why clarity doesn't come from overthinking. But from expressing, experiencing, and being seen in the right environment.",
    },
  ];

  const writtenTestimonials = [
    { name: "US Navy", role: "Senior Official", quote: "This should be a mandatory class for NAVSEA / PROSHIPS employees. If you truly want a workforce with enhanced social skills good enough to deal with disgruntled co-workers or to deal with harassment in the workspace, then you need a solid foundation of Emotional Intelligence." },
    { name: "Eleni Bolla", role: "HP PSG, Greece", quote: "Great use of my time!!! I could listen to Aastha for hours." },
    { name: "Meraj Ali", role: "Amazon, India", quote: "I experienced a 180-degree change in my personality, behaviour, thought process and humanity. I understand the value of my family and relations. I shifted to valuing and taking care of my team. As a result, productivity and efficiency of my team reached heights. I was appreciated in a larger forum by the Leadership Team." },
    { name: "Siddharth Jain", role: "Second Generation Entrepreneur", quote: "I realised that I was the one who took the conversation to a negative direction and a sad end because of my set patterns, and not the other person. I have realised how little we know about ourselves and how our brain takes so much control over our actions, which we have no clue about." },
    { name: "Nipun Daga", role: "Chartered Accountant and Trainer", quote: "I realised that 'to be on time' is a very big pattern that I was running, which actually created a lot of stress. The discussion related to money was an eye-opener for me. I started viewing 'earning money' very differently. It has made me more optimistic and is helping me grow my business each day." },
    { name: "Balaji K", role: "Corporate Leader, Bengaluru", quote: "I had a strained relationship with a colleague, which we were to escalate to our boss for resolution. I applied what I learned to have one conversation with this colleague. It was miraculous. We arrived at an agenda and decided to work together. The meeting with the boss was cancelled." },
    { name: "Satish Shenoy", role: "Corporate Leader", quote: "Despite my 25+ years of Corporate experience, I had severe workplace issues. I realised how I looked at things and handled them matters. When my perspective shifted, the environment at my workplace shifted." },
    { name: "Deepanwita Datta", role: "Corporate Leader, Kolkata", quote: "From being indecisive, not-so-confident and judgmental to having better relationships with my parents and team members is what I achieved. I have resolved some of the long-standing issues. I can see how my limiting beliefs hold me back, and instead of sulking for 7-10 days earlier, now I bounce back in a day." },
    { name: "Rajeev Gola", role: "Corporate Leader, Hyderabad", quote: "If you feel you are stuck in career growth, reaching out to Aastha is your sure-shot answer." },
  ];

  const videoLeaders: { name: string; role: string; videoId?: string; videoSrc?: string; youtubeId?: string; image?: string; avatar?: string }[] = [
    { name: "Deepthi D", role: "Corporate Leader", youtubeId: "vpecGC7Gmss" },
    { name: "Hasil Gora", role: "Corporate Leader", youtubeId: "zxvdAEWENxI" },
    { name: "Kaushik Pasi", role: "Corporate Leader", youtubeId: "0cm6y3lHM1g" },
    { name: "Kenneth Vincent", role: "Business Owner", youtubeId: "43spmXNtfRw" },
    { name: "Mahesh Upasani", role: "Corporate Leader", youtubeId: "wiErOeppFcI" },
  ];

  const [activeVideo, setActiveVideo] = useState<{ name: string; videoId?: string; videoSrc?: string; youtubeId?: string } | null>(null);

  const nameRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("in-view");
            obs.disconnect();
          }
        });
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      {/* ───── Sticky Top Bar ───── */}
      <div className="sticky top-0 z-50 bg-primary text-primary-foreground border-b-2 border-cta">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-2 py-2.5 text-[13px]">
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cta animate-pulse-soft" />
            <span className="tracking-wide">Live Masterclass</span>
            <span className="text-primary-foreground/40">·</span>
            <span className="text-primary-foreground/80">{dateLabel} · 11:00 AM IST</span>
          </p>
          <button
            onClick={scrollToRegister}
            className="inline-flex items-center gap-2 rounded-full bg-cta text-cta-foreground hover:bg-cta-glow transition-smooth tracking-wide px-4 py-1.5 font-semibold shadow-cta"
          >
            Save my seat →
          </button>
        </div>
      </div>

      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden bg-background">
        {/* soft decorative background */}
        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[1100px] rounded-full blur-3xl opacity-60"
            style={{ background: "radial-gradient(circle, hsl(var(--primary-glow) / 0.10), transparent 60%)" }}
          />
          <div className="absolute top-40 -left-32 w-[420px] h-[420px] rounded-full bg-cta/30 blur-3xl" />
          <div className="absolute -top-20 right-0 w-[380px] h-[380px] rounded-full bg-cta/25 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-cta/15 blur-3xl" />
        </div>

        <div className="container py-8 lg:py-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <img src={logo} alt="AASTHA" className="h-12 w-12 object-contain" />
          </div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-start">
            {/* LEFT */}
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
                <span className="h-1.5 w-8 bg-cta rounded-full" />
                A Live Masterclass
              </span>

              <h1 className="mt-6 font-serif text-[40px] sm:text-5xl lg:text-[64px] font-bold leading-[1.05] text-primary">
                Why Successful Leaders Feel{" "}
                <em className="italic font-bold text-highlight-yellow">Silenced</em>
                <span className="block text-2xl lg:text-4xl mt-3 font-bold sm:text-5xl text-primary">
                  (And How to Reclaim Your<em className="italic font-bold text-highlight-yellow ml-2">Voice</em>)
                </span>
              </h1>

              {/* Yellow trust badge */}
              <div className="mt-7 inline-flex flex-wrap items-center gap-x-3 gap-y-2 rounded-full bg-cta/95 text-primary px-5 py-2.5 shadow-cta border border-cta-glow/60">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[12px] sm:text-[13px] font-semibold tracking-wide uppercase">Limited Seats</span>
                <span className="text-primary/40">|</span>
                <span className="text-[12px] sm:text-[13px] font-semibold tracking-wide uppercase">Pure Value</span>
              </div>

              <p className="mt-8 text-lg text-muted-foreground leading-relaxed max-w-xl">
                You've built success.
                <br />
                So why does leadership still feel <em>heavy, lonely, and incomplete?</em>
              </p>

              <p className="mt-5 text-[15px] text-foreground/70 leading-relaxed max-w-xl">
                A <strong className="font-bold text-primary text-highlight-yellow">deeply honest masterclass</strong> for leaders who are ready to stop
                performing strength — and start leading with truth, freedom,
                and inner clarity.
              </p>

              {/* Webinar meta */}
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-foreground/70">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary-glow" />
                  {dateLabel}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary-glow" />
                  11:00 AM IST · 90 mins
                </span>
                <span className="inline-flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary-glow" />
                  Live on Zoom
                </span>
              </div>

              {/* Prominent Hero Countdown */}
              <div className="mt-8">
                <div className="flex items-baseline justify-between mb-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary-glow">
                    Masterclass begins in
                  </p>
                </div>
                <Countdown target={webinarDate} variant="hero" />
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button variant="cta" size="xl" onClick={scrollToRegister}>
                  Save My Seat — <s className="opacity-60 mr-1 font-normal">₹999</s> ₹99 Only <ArrowRight />
                </Button>
              </div>
            </div>

            {/* RIGHT: Aastha portrait */}
            <div className="animate-fade-up lg:sticky lg:top-24">
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary-glow/20 via-cta/10 to-primary-glow/20 blur-2xl opacity-70"
                />
                <img
                  src={heroPortrait}
                  alt="Aastha Tatia"
                  className="relative rounded-2xl shadow-elegant w-full object-cover object-top aspect-[4/5] border border-white/40"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── VIDEO INVITATION + REGISTRATION ───── */}
      <section id="video" className="py-20 lg:py-28 bg-surface">
        <div className="container max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary leading-tight">
              Ready to reclaim your{" "}
              <em className="italic text-gradient-brand">authentic leadership?&nbsp;</em>
            </h2>
          </div>

          <div className="relative mt-14 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-12 items-center">
            {/* Video */}
            <div className="relative group">
              <div
                aria-hidden
                className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary-glow/20 via-cta/10 to-primary-glow/20 blur-2xl opacity-60 group-hover:opacity-100 transition-smooth duration-500"
              />
              <div
                role="button"
                tabIndex={0}
                onClick={() => setVideoPlaying(true)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setVideoPlaying(true); }}
                className="relative block w-full aspect-video rounded-2xl overflow-hidden border border-border shadow-elegant transition-bounce duration-500 group-hover:-translate-y-1 group-hover:shadow-glow cursor-pointer"
                aria-label="Play invitation video from Aastha"
              >
                {!videoPlaying ? (
                  <>
                    <img
                      src={videoPreview}
                      alt="Aastha Tatia invitation"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-smooth duration-700"
                      style={{ objectPosition: "center 20%" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <span className="relative flex items-center justify-center">
                        <span className="absolute h-24 w-24 rounded-full border border-white/30 animate-ping opacity-60" />
                        <span className="absolute h-32 w-32 rounded-full border border-white/15 animate-ping opacity-40" style={{ animationDelay: "0.6s" }} />
                        <span className="relative flex items-center justify-center h-20 w-20 rounded-full bg-white/95 text-primary shadow-elegant group-hover:scale-110 transition-bounce">
                          <Play className="h-7 w-7 fill-current ml-1" />
                        </span>
                      </span>
                      <p className="mt-1 text-xs text-white/65 uppercase tracking-[0.2em]">
                        Tap to play
                      </p>
                    </div>
                  </>
                ) : (
                  <iframe
                    src="https://www.youtube.com/embed/SUBTrN3jjvY?autoplay=1"
                    className="absolute inset-0 w-full h-full"
                    title="Invitation from Aastha"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </div>

            {/* Registration form */}
            <div id="register">
              <RegistrationForm variant="panel" ctaLabel="Reserve My Seat" />
            </div>
          </div>
        </div>
      </section>

      {/* ───── NOT ABOUT FIXING YOU ───── */}
      <section className="relative py-20 lg:py-28 bg-cta-soft/50 overflow-hidden">
        <div aria-hidden className="absolute top-10 right-10 h-2 w-2 rounded-full bg-cta" />
        <div aria-hidden className="absolute bottom-16 left-12 h-2 w-2 rounded-full bg-cta" />
        <div className="container max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.25em] text-primary-glow">
            <HandHeart className="h-3.5 w-3.5 text-cta" />
            A different kind of room
          </span>
          <h2 className="mt-4 font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-primary leading-tight whitespace-nowrap">
            This masterclass is <em className="italic">not</em> about fixing you.
          </h2>

          <div className="mt-10 space-y-4 text-lg text-muted-foreground leading-relaxed font-light">
            <p>You don't need to become someone else.</p>
            <p>You don't need more strategies to "perform better."</p>
            <p className="font-serif text-2xl sm:text-3xl italic text-primary pt-4">
              What you need… is space.
            </p>
            <p className="text-base">To be real. To be honest. To be heard — without losing respect.</p>
            
          </div>

          <h3 className="mt-14 font-serif text-2xl sm:text-3xl italic text-primary text-left">
            A space where,
          </h3>
          <div className="mt-6 grid sm:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            {[
              { line: "You don't have to perform strength", Icon: Sparkles },
              { line: "You don't have to hide what you truly think", Icon: Eye },
              { line: "You don't have to carry leadership alone", Icon: HandHeart },
            ].map(({ line, Icon }) => (
              <div key={line} className="bg-background p-8">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-cta shadow-cta">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={2.25} />
                </span>
                <p className="mt-4 font-serif text-lg italic text-primary leading-snug">{line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider label="Does this sound like you?" />

      {/* ───── WHO IS THIS FOR ───── */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="container">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.25em] text-primary-glow">
              <Target className="h-3.5 w-3.5 text-cta" />
              Who this is for
            </span>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary leading-tight">
              This masterclass is{" "}
              <em className="italic text-gradient-brand">for you</em> if…
            </h2>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-x-12 gap-y-2">
            {forYou.map((line, i) => (
              <div
                key={i}
                className="group flex items-start gap-4 py-4 border-b border-border/60 hover:border-primary-glow/40 transition-smooth"
              >
                <span className="mt-0.5 flex items-center justify-center h-7 w-7 rounded-full bg-cta shadow-cta shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={2.5} />
                </span>
                <p className="text-foreground/85 leading-relaxed group-hover:text-primary transition-smooth">
                  {line}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <p className="font-serif text-2xl italic text-primary">Sounds familiar?</p>
            <p className="mt-2 text-muted-foreground">This masterclass will be your turning point.</p>
            <Button variant="cta" size="xl" className="mt-6" onClick={scrollToRegister}>
              Reserve Your Spot — <s className="opacity-60 mr-1 font-normal">₹999</s> ₹99 Only <ArrowRight />
            </Button>
          </div>
        </div>
      </section>

      <SectionDivider label="What you'll learn" />

      {/* ───── THREE SECRETS (interactive reveal) ───── */}
      <section className="py-20 lg:py-28 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" aria-hidden style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        <div className="container relative max-w-5xl">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.25em] text-cta">
              <Key className="h-3.5 w-3.5" />
              Inside the masterclass
            </span>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              This is what you'll{" "}
              <em className="italic text-cta">discover.</em>
            </h2>
            <p className="mt-5 text-white/70">Tap each secret to reveal.</p>
          </div>

          <div className="mt-14 space-y-4">
            {secrets.map((s, i) => {
              const open = revealed[i];
              return (
                <button
                  key={i}
                  onClick={() => toggleSecret(i)}
                  className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-smooth p-7 sm:p-8 group"
                >
                  <div className="flex items-start gap-6">
                    <span className="font-serif text-4xl sm:text-5xl italic text-cta/80 leading-none shrink-0 w-12">
                      {s.n}
                    </span>
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-2">
                        Secret {i + 1}
                      </p>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-snug">
                        {s.hook}{" "}
                        <span
                          className={`italic transition-all duration-500 ${
                            open ? "text-cta opacity-100" : "text-white/20 blur-[6px] select-none"
                          }`}
                        >
                          {s.reveal}
                        </span>
                      </h3>
                      <div
                        className={`grid transition-all duration-500 ${
                          open ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="text-white/75 leading-relaxed max-w-2xl">{s.copy}</p>
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 mt-2 flex items-center justify-center h-9 w-9 rounded-full border border-white/15 text-white/60 group-hover:text-cta group-hover:border-cta/40 transition-smooth">
                      {open ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-14 text-center">
            <p className="font-serif text-xl sm:text-2xl italic text-white/90 max-w-2xl mx-auto leading-relaxed">
              "With these three secrets, something inside you will be shaken.
              <br />
              You will not walk away the same leader."
            </p>
            <Button variant="cta" size="xl" className="mt-8" onClick={scrollToRegister}>
              Yes, I want these secrets <ArrowRight />
            </Button>
          </div>
        </div>
      </section>

      {/* ───── TESTIMONIALS ───── */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.25em] text-primary-glow">
              <Star className="h-3.5 w-3.5 text-cta fill-cta" />
              In their words
            </span>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary leading-tight">
              What leaders are{" "}
              <em className="italic text-gradient-brand">saying.</em>
            </h2>
          </div>

          {/* Video testimonial cards */}
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-5 gap-4">
            {videoLeaders.map((l) => (
              <button
                type="button"
                key={l.name}
                onClick={() => setActiveVideo({ name: l.name, videoId: l.videoId, videoSrc: l.videoSrc, youtubeId: l.youtubeId })}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-border bg-gradient-brand cursor-pointer text-left"
              >
                {l.image ? (
                  <img
                    src={l.image}
                    alt={`${l.name} testimonial`}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-smooth duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-brand" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="flex items-center justify-center h-14 w-14 rounded-full bg-white/95 text-primary shadow-elegant group-hover:scale-110 transition-bounce">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </span>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-4 text-white flex items-center gap-3">
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/95 text-primary font-serif text-sm font-bold ring-2 ring-white/40 shadow-elegant">
                    {l.avatar ? (
                      <img
                        src={l.avatar}
                        alt={`${l.name} avatar`}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      l.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-lg leading-tight truncate">{l.name}</p>
                    <p className="text-xs text-white/70 truncate">{l.role}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black border-0">
              <DialogTitle className="sr-only">{activeVideo?.name} testimonial</DialogTitle>
              {activeVideo && (
                <div className="aspect-video w-full">
                  {activeVideo.youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      title={`${activeVideo.name} testimonial`}
                    />
                  ) : activeVideo.videoSrc ? (
                    <video
                      src={activeVideo.videoSrc}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full bg-black"
                      title={`${activeVideo.name} testimonial`}
                    />
                  ) : (
                    <iframe
                      src={`https://drive.google.com/file/d/${activeVideo.videoId}/preview`}
                      allow="autoplay"
                      allowFullScreen
                      className="w-full h-full"
                      title={`${activeVideo.name} testimonial`}
                    />
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Written testimonials carousel */}
          <Carousel
            className="mt-10"
            opts={{ loop: true, align: "start" }}
            plugins={[autoplayPlugin.current]}
          >
            <CarouselContent className="-ml-5">
              {writtenTestimonials.map((t) => (
                <CarouselItem key={t.name} className="pl-5 md:basis-1/2 lg:basis-1/3">
                  <figure className="h-full rounded-2xl border border-border bg-card p-6 hover:shadow-elegant transition-smooth flex flex-col">
                    <Quote className="h-5 w-5 text-cta mb-3" />
                    <blockquote className="font-serif text-lg italic text-primary leading-snug flex-1">
                      "{t.quote}"
                    </blockquote>
                    <figcaption className="mt-4 pt-4 border-t border-border">
                      <p className="font-medium text-sm text-primary">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </figcaption>
                  </figure>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-4" />
            <CarouselNext className="hidden sm:flex -right-4" />
          </Carousel>

          <div className="mt-12 text-center">
            <Button variant="cta" size="xl" onClick={scrollToRegister}>
              I'm ready to be next <ArrowRight />
            </Button>
          </div>
        </div>
      </section>

      {/* ───── IMAGINE LEADING LIKE THIS ───── */}
      <section className="relative py-20 lg:py-28 bg-cta-soft/60 overflow-hidden">
        <div aria-hidden className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-cta/25 blur-3xl" />
        <div aria-hidden className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full bg-cta/20 blur-3xl" />
        <div className="container max-w-4xl">
          <div className="text-center">
            <h2 className="font-serif text-[22px] sm:text-[28px] lg:text-5xl font-bold text-primary leading-tight whitespace-nowrap">
              Still Wondering If this Masterclass is for You?
            </h2>
          </div>

          <h4 className="mt-14 font-serif text-2xl sm:text-3xl lg:text-4xl italic text-primary text-left my-[6px]">
            Imagine leading <em className="text-gradient-brand">like this…</em>
          </h4>
          <div className="mt-6 space-y-px bg-border/60 rounded-2xl overflow-hidden border border-border">
            {[
              "Saying what needs to be said — without fear.",
              "Being respected not for your position, but for your presence.",
              "Having a team that doesn't just listen, but owns.",
              "Feeling aligned, not conflicted, within yourself.",
            ].map((line) => (
              <div key={line} className="bg-card p-6 sm:p-8 flex items-start gap-5 hover:bg-surface transition-smooth">
                <span className="font-serif text-2xl italic text-cta leading-none mt-1">→</span>
                <p className="font-serif text-xl sm:text-2xl font-light text-primary italic leading-snug">
                  {line}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center space-y-3">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary leading-tight">
              <span className="text-highlight-yellow">This is not a distant ideal.</span>
            </h3>
            <p className="text-muted-foreground">It begins with awareness. And the right space.</p>
            <p className="font-serif text-xl italic text-primary pt-2 mt-6">
              If something in you resonated, don't ignore it.
            </p>
            <Button variant="cta" size="xl" className="mt-6" onClick={scrollToRegister}>
              Reserve My Spot — <s className="opacity-60 mr-1 font-normal">₹999</s> ₹99 Only <ArrowRight />
            </Button>
          </div>
        </div>
      </section>

      

      {/* ───── ABOUT AASTHA ───── */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-brand opacity-[0.07] rounded-3xl blur-2xl" aria-hidden />
              <img
                src={portrait}
                alt="Aastha Tatia, Happiness Coach for Leaders"
                width={896}
                height={1152}
                loading="lazy"
                className="relative rounded-2xl shadow-elegant w-full max-w-xl mx-auto object-cover object-top aspect-[4/5]"
              />
            </div>

            <div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-primary leading-tight whitespace-nowrap">
                Meet your Coach <em ref={nameRef} className="emphasize-name italic font-bold text-highlight-yellow">Aastha Tatia</em>
              </h2>

              <div className="mt-7 space-y-4 text-foreground/75 leading-relaxed">
                <p>
                  Aastha Tatia is a Happiness Coach for Leaders
                </p>
                <p>
                  For the longest time, she didn't even realise she was living
                  someone else's version of life.
                </p>
                <p className="text-muted-foreground">
                  Engineering. MBA. A corporate career across Dubai and Mumbai.
                  It all looked… <em>successful.</em> But inside, she was messed up,
                  lonely, running away.
                </p>
                <p>
                  She went from suppressing her own voice in the rooms that
                  mattered, to stepping into her power and creating a flourishing
                  personal and professional life.
                </p>
              </div>

              <ul className="mt-8 space-y-3">
                {[
                  "Founder of Authentic Leadership Circle",
                  "10 years of Corporate Experience",
                  "8+ years of Coaching Experience",
                  "5000+ Leaders supported through different programs",
                  "Amazon #1 Bestseller Author of 'Survive or Thrive'",
                  "TEDx Speaker",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3 text-sm text-foreground/80">
                    <Award className="h-4 w-4 text-cta mt-0.5 shrink-0" />
                    {line}
                  </li>
                ))}
              </ul>

              <figure className="mt-10 relative rounded-2xl bg-gradient-to-br from-cta/25 via-cta/10 to-transparent border border-cta/40 p-7 sm:p-8 shadow-cta">
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1.5 bg-cta text-primary text-[10px] font-bold uppercase tracking-[0.25em] px-3 py-1 rounded-full shadow-cta">
                  <Sparkles className="h-3 w-3" />
                  Aastha's Vision
                </span>
                <Quote className="h-6 w-6 text-cta mb-3" />
                <blockquote className="font-serif text-xl sm:text-2xl italic text-primary leading-relaxed">
                  "A world where every human being owns their voice and expresses
                  who they truly are — <span className="text-highlight-yellow not-italic font-semibold">unapologetically, uninhibitedly, and responsibly.</span>"
                </blockquote>
              </figure>

              <Button variant="cta" size="xl" className="mt-8" onClick={scrollToRegister}>
                Learn from Aastha, Register Now <ArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider label="Bonuses" />

      {/* ───── BONUSES ───── */}
      <section className="relative py-20 lg:py-28 bg-cta-soft/40 overflow-hidden">
        <div aria-hidden className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-cta/30 blur-3xl" />
        <div aria-hidden className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-cta/20 blur-3xl" />
        <div className="container relative max-w-5xl">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
              <span className="h-1.5 w-6 bg-cta rounded-full" />
              When you attend live
            </span>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary leading-tight">
              You will walk away with Bonuses worth <em className="italic text-highlight-yellow">₹9,998 Absolutely FREE!</em>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Unlocked for you at the end of the live masterclass.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-2 gap-6">
            {[
              {
                tag: "Bonus 01",
                title: "8 Ways to Have a Super Productive Day",
                value: "₹4,999",
                copy: "Move beyond the uncertainty between planning and doing — and turn your day into a productive, fulfilling one.",
                image: bonusProductive,
              },
              {
                tag: "Bonus 02",
                title: "Start Your Journey with the Happiness Journal",
                value: "₹4,999",
                copy: "A simple, straightforward tool to help you experience a real shift wherever you're stuck right now.",
                image: bonusJournal,
              },
            ].map((b) => (
              <div
                key={b.tag}
                className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:shadow-elegant transition-smooth"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-cta-soft/40">
                  <img
                    src={b.image}
                    alt={b.title}
                    width={1024}
                    height={768}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-smooth duration-500"
                  />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-cta text-primary text-[10px] font-bold uppercase tracking-[0.25em] px-3 py-1 rounded-full shadow-cta">
                    <Gift className="h-3 w-3" />
                    {b.tag}
                  </span>
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-end">
                    <span className="text-xs font-medium text-muted-foreground line-through">
                      {b.value}
                    </span>
                  </div>
                  <h3 className="mt-2 font-serif text-2xl font-bold text-primary leading-snug whitespace-nowrap">
                    {b.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{b.copy}</p>
                  <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-cta-foreground bg-cta px-3 py-1 rounded-full">
                    <Sparkles className="h-3.5 w-3.5" />
                    Included for live attendees
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="cta" size="xl" onClick={scrollToRegister}>
              Unlock My Bonuses <ArrowRight />
            </Button>
          </div>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="py-20 lg:py-28">
        <div className="container max-w-3xl">
          <div className="text-center">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary leading-tight">
              Got Questions?
            </h2>
            <p className="mt-4 font-serif text-xl sm:text-2xl text-primary/80">
              Here's everything{" "}
              <em className="italic text-gradient-brand">you need to know.</em>
            </p>
          </div>

          <Accordion type="single" collapsible className="mt-12 w-full">
            {[
              {
                q: "What happens when I register for the masterclass?",
                a: "Once you successfully register, you'll be redirected to a confirmation page with further details. You'll receive a confirmation email and a confirmation WhatsApp message as well.",
              },
              {
                q: "Is this webinar for me if I'm already successful in my career?",
                a: "Yes. In fact, this is exactly who it's for. This space is for leaders who have achieved success externally — but feel something is missing internally. If you've ever felt unheard, held back, or disconnected despite your success, this will resonate deeply.",
              },
              {
                q: "Will I be asked to share or open up in front of others?",
                a: "No. This is not a group sharing session. You can simply listen, reflect, and take what feels relevant. The space is designed to feel safe and pressure-free.",
              },
              {
                q: "How is this masterclass different from other leadership trainings?",
                a: "This masterclass goes beyond surface-level strategies. It focuses on what most leadership spaces ignore — your inner experience, your voice, and your emotional truth.",
              },
              {
                q: "I'm not naturally expressive. Will this still help me?",
                a: "Absolutely. This is not about becoming louder or more expressive. It's about understanding why you hold back — and gently reconnecting with your authentic voice in a way that feels natural to you.",
              },
              {
                q: "Will recordings or replays be available later?",
                a: "No. There will be no recordings or replays available. Please ensure you attend the session live and do not miss it.",
              },
              {
                q: "I have attended Masterclasses earlier and they're sales pitches. Will there be an upsell here too?",
                a: "That's a fair concern. The masterclass is a complete experience in itself. However, if you wish to go deeper, build discipline and consistency, and be part of a like-minded growth ecosystem, you'll have an opportunity to join The Authentic Leadership Circle — a paid, lifetime-access community.",
              },
            ].map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-border"
              >
                <AccordionTrigger className="text-left font-serif text-lg sm:text-xl font-normal text-primary hover:text-primary-glow hover:no-underline py-6">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-foreground/75 leading-relaxed pb-6 text-[15px]">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center">
            <p className="font-serif text-xl italic text-primary">
              Still have doubts? Join in to get the answers.
            </p>
            <Button variant="cta" size="xl" className="mt-6" onClick={scrollToRegister}>
              Register Now <ArrowRight />
            </Button>
          </div>
        </div>
      </section>

      <SectionDivider label="Don't miss this" />

      {/* ───── FINAL CTA ───── */}
      <section className="py-24 lg:py-32 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" aria-hidden style={{
          backgroundImage: "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="container relative max-w-3xl text-center">
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1]">
            Leadership was never meant to feel like a constant{" "}
            <em className="italic text-cta">performance.</em>
          </h2>
          <p className="mt-8 text-lg text-white/80 leading-relaxed">
            You don't have to choose between{" "}
            <em className="italic font-bold text-cta not-italic-marker bg-cta/10 px-1 rounded">being respected...&nbsp;</em>{" "}
            and{" "}
            <em className="italic font-bold text-cta bg-cta/10 px-1 rounded">being real.</em>
            <br />
            <span className="font-serif italic font-bold text-cta text-2xl sm:text-3xl mt-2 inline-block">You can have both.&nbsp;</span>
          </p>
          <p className="mt-4 font-bold text-primary-foreground">And it starts here.</p>

          <div className="mt-12 flex flex-col items-center gap-6">
            <Countdown target={webinarDate} variant="dark" />
            <Button variant="cta" size="xl" onClick={scrollToRegister}>
              Don't miss out — <s className="opacity-60 mr-1 font-normal">₹999</s> ₹99 Only <ArrowRight />
            </Button>
            <p className="flex items-center gap-2 text-xs text-white/50">
              <ShieldCheck className="h-3.5 w-3.5" />
              Limited seats · No replays · Live & honest
            </p>
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="py-10 border-t border-border bg-background">
        <div className="container flex flex-col items-center gap-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="AASTHA" className="h-9 w-9 object-contain" />
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <a href="/privacy-policy" className="hover:text-primary transition-smooth">
              Privacy Policy
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a href="/terms-and-conditions" className="hover:text-primary transition-smooth">
              Terms &amp; Conditions
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a href="/refund-policy" className="hover:text-primary transition-smooth">
              Refund Policy
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a
              href="mailto:connect@authenticleadershipcircle.com"
              className="hover:text-primary transition-smooth"
            >
              Contact
            </a>
          </nav>
          <p className="text-xs text-center">
            © {new Date().getFullYear()} Aastha Tatia · Authentic Leadership Circle
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Index;
