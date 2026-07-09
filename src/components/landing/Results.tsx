"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Zap, Users2, Brain } from "lucide-react";
import { Container } from "./shared/Container";
import { SectionHeading } from "./shared/SectionHeading";
import { Reveal } from "./shared/Reveal";

const stats = [
  { value: 42, decimals: 0, suffix: "%", label: "Increase in team productivity" },
  { value: 6, decimals: 0, prefix: "+", suffix: " hrs", label: "Saved per week, per team" },
  { value: 31, decimals: 0, suffix: "%", label: "Reduction in tool & operations cost" },
  { value: 3.2, decimals: 1, suffix: "x", label: "Average ROI within 6 months" },
];

const outcomes = [
  { icon: Zap, title: "Faster decisions", description: "Answers arrive in seconds, not after a week of pulling reports." },
  { icon: Users2, title: "Better collaboration", description: "Marketing, sales, and ops finally work from the same live data." },
  { icon: Brain, title: "Sharper customer experience", description: "Every team acts on the same customer context, in real time." },
];

function Counter({ value, decimals = 0, prefix = "", suffix = "" }: { value: number; decimals?: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    let raf = 0;

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function Results() {
  return (
    <section id="results" className="relative bg-background py-24 lg:py-32 scroll-mt-24">
      <Container>
        <SectionHeading
          badge="Business Impact"
          title="Growth teams that switch to Calixo see it immediately."
          subtitle="These aren't vanity numbers — they're the compounding effect of unifying data, AI, and workflows into one system."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div className="rounded-3xl border border-border bg-card p-7 text-center">
                <p className="text-[40px] font-bold leading-none tracking-tight text-transparent bg-gradient-to-br from-primary to-[#8B5CF6] bg-clip-text">
                  <Counter value={stat.value} decimals={stat.decimals} prefix={stat.prefix} suffix={stat.suffix} />
                </p>
                <p className="mt-3 text-[13.5px] leading-snug text-muted-foreground">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {outcomes.map((outcome, i) => (
            <Reveal key={outcome.title} delay={0.1 + i * 0.08}>
              <div className="flex items-start gap-3.5 rounded-2xl border border-border bg-surface/50 p-5">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <outcome.icon size={16} />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-foreground">{outcome.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{outcome.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
