"use client";

import { motion } from "framer-motion";
import {
  Users2,
  BarChart3,
  Megaphone,
  Share2,
  PenSquare,
  FileBarChart,
  Workflow,
  Bot,
  Zap,
  LogIn,
  LayoutDashboard,
  Database,
  Boxes,
} from "lucide-react";
import { Container } from "./shared/Container";
import { SectionHeading } from "./shared/SectionHeading";
import { Reveal } from "./shared/Reveal";

const nodes = [
  { icon: Users2, label: "CRM & Sales" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Megaphone, label: "Ads" },
  { icon: Share2, label: "Social" },
  { icon: PenSquare, label: "Content" },
  { icon: FileBarChart, label: "Reports" },
  { icon: Workflow, label: "Automation" },
  { icon: Bot, label: "AI Agents" },
];

const radius = 40;
const points = nodes.map((node, i) => {
  const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
  return {
    ...node,
    x: 50 + radius * Math.cos(angle),
    y: 50 + radius * Math.sin(angle),
  };
});

const pillars = [
  { icon: LogIn, label: "One Login", caption: "Single sign-on, every module" },
  { icon: Bot, label: "One AI", caption: "A copilot that knows it all" },
  { icon: LayoutDashboard, label: "One Dashboard", caption: "Every metric, one screen" },
  { icon: Boxes, label: "One Platform", caption: "No more tool switching" },
  { icon: Database, label: "One Source of Truth", caption: "Data everyone trusts" },
];

export default function Solution() {
  return (
    <section className="relative overflow-hidden bg-surface/40 py-24 lg:py-32">
      <Container>
        <SectionHeading
          badge="The Solution"
          title="Meet Calixo — the one platform behind everything."
          subtitle="Every tool your growth team touches, unified into a single intelligent operating system. One login. One AI. One dashboard. One source of truth."
        />

        <Reveal delay={0.1}>
          <div className="relative mx-auto mt-16 aspect-square w-full max-w-[520px]">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
              {points.map((p, i) => (
                <motion.line
                  key={p.label}
                  x1={50}
                  y1={50}
                  x2={p.x}
                  y2={p.y}
                  stroke="var(--primary)"
                  strokeOpacity={0.25}
                  strokeWidth={0.4}
                  strokeDasharray="2 2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.06, ease: "easeOut" }}
                />
              ))}
            </svg>

            {/* Center hub */}
            <div className="absolute left-1/2 top-1/2 flex h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
              <motion.span
                className="absolute inset-0 rounded-full bg-primary/20"
                animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#8B5CF6] shadow-xl shadow-primary/30">
                <Zap size={30} className="text-white" />
              </div>
            </div>

            {/* Satellite nodes */}
            {points.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="absolute flex w-[92px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-card">
                  <p.icon size={18} />
                </div>
                <span className="text-center text-[11px] font-semibold leading-tight text-muted-foreground">{p.label}</span>
              </motion.div>
            ))}
          </div>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.label} delay={i * 0.06}>
              <div className="flex h-full flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <pillar.icon size={18} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-foreground">{pillar.label}</p>
                  <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{pillar.caption}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
