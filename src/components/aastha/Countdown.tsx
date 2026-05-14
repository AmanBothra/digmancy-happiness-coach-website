import { useEffect, useState } from "react";

interface CountdownProps {
  target: Date;
  variant?: "light" | "dark" | "hero" | "ring";
}

const pad = (n: number) => n.toString().padStart(2, "0");

/* ───────── Animated number that flips on change ───────── */
const FlipNumber = ({ value, dark }: { value: string; dark: boolean }) => {
  const [display, setDisplay] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value !== display) {
      setFlipping(true);
      const t = setTimeout(() => {
        setDisplay(value);
        setFlipping(false);
      }, 180);
      return () => clearTimeout(t);
    }
  }, [value, display]);

  return (
    <span
      key={display}
      className={`inline-block tabular-nums transition-all duration-200 ${
        flipping ? "opacity-0 -translate-y-2 blur-[2px]" : "opacity-100 translate-y-0 blur-0"
      } ${dark ? "text-white" : "text-primary"}`}
    >
      {display}
    </span>
  );
};

const Countdown = ({ target, variant = "dark" }: CountdownProps) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const items = [
    { label: "Days", value: pad(days) },
    { label: "Hours", value: pad(hours) },
    { label: "Minutes", value: pad(minutes) },
    { label: "Seconds", value: pad(seconds) },
  ];

  /* ───────── HERO variant — large, prominent, subtle pulse ───────── */
  if (variant === "hero") {
    return (
      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-3 rounded-2xl bg-gradient-to-r from-cta/20 via-primary-glow/10 to-cta/20 blur-2xl opacity-70 animate-pulse-soft"
        />
        <div className="relative grid grid-cols-4 gap-2 sm:gap-3">
          {items.map((it, i) => (
            <div
              key={it.label}
              className="relative flex flex-col items-center justify-center rounded-2xl bg-card border border-border shadow-elegant px-2 sm:px-4 py-4 sm:py-5 overflow-hidden"
            >
              {/* shine sweep on the seconds card */}
              {i === 3 && (
                <span
                  aria-hidden
                  className="absolute inset-y-0 -left-12 w-12 bg-gradient-to-r from-transparent via-cta/25 to-transparent animate-[shine_2.5s_ease-in-out_infinite]"
                />
              )}
              <span className="relative font-serif text-3xl sm:text-5xl font-light leading-none">
                <FlipNumber value={it.value} dark={false} />
              </span>
              <span className="relative mt-2 text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {it.label}
              </span>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes shine {
            0% { transform: translateX(0); }
            60%, 100% { transform: translateX(900%); }
          }
        `}</style>
      </div>
    );
  }

  /* ───────── RING variant — circular progress ring per unit ───────── */
  if (variant === "ring") {
    const totals = [
      { ...items[0], pct: Math.min(1, days / 30) },
      { ...items[1], pct: hours / 24 },
      { ...items[2], pct: minutes / 60 },
      { ...items[3], pct: seconds / 60 },
    ];
    const totalSecs = days * 86400 + hours * 3600 + minutes * 60 + seconds;
    const urgent = totalSecs > 0 && totalSecs < 3600 * 24;

    return (
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.25em] text-primary-glow">
            <span className={`h-1.5 w-1.5 rounded-full bg-cta ${urgent ? "animate-pulse" : "animate-pulse-soft"}`} />
            Time remaining
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums">
            Live in {days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m`}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {totals.map((it) => {
            const r = 22;
            const c = 2 * Math.PI * r;
            const offset = c * (1 - it.pct);
            return (
              <div key={it.label} className="flex flex-col items-center">
                <div className="relative h-14 w-14">
                  <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r={r}
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="3"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r={r}
                      fill="none"
                      stroke="hsl(var(--cta))"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={c}
                      strokeDashoffset={offset}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-serif text-base font-medium tabular-nums text-primary">
                    <FlipNumber value={it.value} dark={false} />
                  </span>
                </div>
                <span className="mt-1.5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  {it.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ───────── default light/dark ───────── */
  const isDark = variant === "dark";

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {items.map((it, i) => (
        <div key={it.label} className="flex items-center gap-2 sm:gap-3">
          <div
            className={`flex flex-col items-center justify-center rounded-xl px-3 sm:px-5 py-2 sm:py-3 min-w-[64px] sm:min-w-[78px] ${
              isDark
                ? "bg-white/10 backdrop-blur-md border border-white/15"
                : "bg-white border border-border shadow-soft"
            }`}
          >
            <span className={`text-2xl sm:text-3xl font-bold tabular-nums ${isDark ? "text-white" : "text-primary"}`}>
              {it.value}
            </span>
            <span
              className={`text-[10px] sm:text-xs uppercase tracking-widest mt-1 ${
                isDark ? "text-white/70" : "text-muted-foreground"
              }`}
            >
              {it.label}
            </span>
          </div>
          {i < items.length - 1 && (
            <span className={`text-xl font-bold ${isDark ? "text-white/40" : "text-primary/30"}`}>:</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Countdown;
