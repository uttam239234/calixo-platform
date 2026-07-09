"use client";

import { Bot, Network, Sparkles, LineChart, Workflow, FileBarChart, CheckCircle2, ArrowUpRight, Undo2 } from "lucide-react";
import { Container } from "./shared/Container";
import { SectionHeading } from "./shared/SectionHeading";
import { Reveal } from "./shared/Reveal";

const capabilities = [
  { icon: Bot, title: "AI Copilot", description: "A conversational assistant that understands context across every module." },
  { icon: Network, title: "AI Agents", description: "Autonomous agents that plan and execute multi-step work on your behalf." },
  { icon: Sparkles, title: "Content AI", description: "On-brand copy, creative, and campaigns generated in seconds, not days." },
  { icon: LineChart, title: "Analytics AI", description: "Explains why every metric moved — no more digging through dashboards." },
  { icon: Workflow, title: "Workflow AI", description: "Builds, monitors, and continuously optimizes your automations." },
  { icon: FileBarChart, title: "Report AI", description: "Turns raw data into executive-ready narratives automatically." },
];

export default function AIEverywhere() {
  return (
    <section id="ai" className="relative overflow-hidden bg-[#0B0D17] py-24 lg:py-32 scroll-mt-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/2 top-0 h-[520px] w-[820px] translate-x-1/2 rounded-full bg-[#8B5CF6]/15 blur-[140px]" />
      </div>

      <Container className="relative">
        <SectionHeading
          badge="AI Everywhere"
          badgeTone="ai"
          light
          title="AI isn't a feature. It's built into every module."
          subtitle="Calixo's AI doesn't live in a single chat window — it works inside analytics, content, workflows, and reporting, taking action everywhere your team operates."
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:items-center">
          <Reveal direction="right">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6366F1] to-[#A78BFA]">
                  <Bot size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold text-white">Calixo AI Copilot</p>
                  <p className="text-[11px] text-white/40">Connected to Analytics, Ads, Content & Reports</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-white/[0.08] px-4 py-2.5 text-[13.5px] text-white/85">
                    Why did our conversion rate drop last week?
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366F1] to-[#A78BFA]">
                    <Bot size={12} className="text-white" />
                  </div>
                  <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.04] px-4 py-3 text-[13.5px] leading-relaxed text-white/70">
                    Conversion fell 2.3 pts, mostly from Paid Social — landing page load time rose 40% after Tuesday&apos;s
                    deploy. I&apos;ve paused the two lowest-performing ad sets automatically.
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#34D399]/10 px-2.5 py-1 text-[11px] font-medium text-[#34D399]">
                        <CheckCircle2 size={11} /> Applied automatically
                      </span>
                      <button className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-medium text-white/70 transition-colors hover:bg-white/10">
                        <Undo2 size={11} /> Undo pause
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-white/[0.08] px-4 py-2.5 text-[13.5px] text-white/85">
                    Draft a LinkedIn post announcing our Q3 results
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366F1] to-[#A78BFA]">
                    <Bot size={12} className="text-white" />
                  </div>
                  <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.04] px-4 py-3 text-[13.5px] leading-relaxed text-white/70">
                    Here&apos;s a draft ready for review —
                    <div className="mt-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[12.5px] italic text-white/50">
                      &ldquo;Q3 was a record quarter — 34% revenue growth and 1,200+ new customers. Here&apos;s what powered it 🚀&rdquo;
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white text-[#0B0D17] px-2.5 py-1 text-[11px] font-semibold">
                      Insert into Content Studio <ArrowUpRight size={11} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {capabilities.map((cap, i) => (
              <Reveal key={cap.title} delay={i * 0.07} direction="left">
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A78BFA]/15 text-[#C4B5FD]">
                    <cap.icon size={18} />
                  </div>
                  <h3 className="mt-3.5 text-[15px] font-semibold text-white">{cap.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">{cap.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
