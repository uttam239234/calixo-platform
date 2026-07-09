import {
  Users2,
  BarChart3,
  Megaphone,
  Share2,
  FileBarChart,
  Mail,
  Search,
  Workflow,
  Unplug,
  Clock,
  FileWarning,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { Container } from "./shared/Container";
import { SectionHeading } from "./shared/SectionHeading";
import { Reveal } from "./shared/Reveal";

const scatteredTools = [
  { icon: Users2, label: "CRM", rotate: "-rotate-3", offset: "translate-y-1" },
  { icon: BarChart3, label: "Analytics", rotate: "rotate-2", offset: "-translate-y-2" },
  { icon: Megaphone, label: "Ad Platforms", rotate: "rotate-3", offset: "translate-y-3" },
  { icon: Share2, label: "Social Tools", rotate: "-rotate-2", offset: "-translate-y-1" },
  { icon: FileBarChart, label: "Spreadsheets", rotate: "rotate-1", offset: "translate-y-2" },
  { icon: Mail, label: "Email Platform", rotate: "-rotate-3", offset: "-translate-y-3" },
  { icon: Search, label: "SEO Tools", rotate: "rotate-2", offset: "translate-y-1" },
  { icon: Workflow, label: "Automation", rotate: "-rotate-1", offset: "-translate-y-2" },
];

const painPoints = [
  {
    icon: EyeOff,
    title: "Disconnected data",
    description: "Every tool holds its own version of the truth — nobody trusts a single number in the boardroom.",
  },
  {
    icon: Clock,
    title: "Hours of manual work",
    description: "Teams burn entire days copying numbers between spreadsheets instead of acting on them.",
  },
  {
    icon: FileWarning,
    title: "Reporting chaos",
    description: "Monthly reports become a scramble across a dozen exports, logins, and half-updated dashboards.",
  },
  {
    icon: KeyRound,
    title: "Tool sprawl & cost",
    description: "Dozens of logins, overlapping subscriptions, and no one owns the full picture of what's working.",
  },
];

function PainPointCard({ point }: { point: (typeof painPoints)[number] }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <point.icon size={20} />
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-foreground">{point.title}</h3>
        <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{point.description}</p>
      </div>
    </div>
  );
}

export default function Problem() {
  return (
    <section className="relative bg-background py-24 lg:py-32">
      <Container>
        <SectionHeading
          badge="The Problem"
          badgeTone="primary"
          title="Your growth stack is scattered across 15 different tools."
          subtitle="CRM here. Analytics there. Ads in one tab, social in another, reports in a spreadsheet nobody trusts. Every disconnected tool is a blind spot — and blind spots slow growth."
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <Reveal direction="right">
            <div className="relative rounded-[28px] border border-border bg-surface/60 p-8 sm:p-10">
              <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_50%_40%,rgba(239,68,68,0.06),transparent_65%)]" />
              <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {scatteredTools.map((tool) => (
                  <div
                    key={tool.label}
                    className={`relative flex flex-col items-center gap-2 rounded-2xl border border-dashed border-destructive/25 bg-card px-3 py-5 text-center shadow-sm ${tool.rotate} ${tool.offset}`}
                  >
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive/90 text-white shadow-sm">
                      <Unplug size={10} />
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/15 text-muted-foreground">
                      <tool.icon size={18} />
                    </div>
                    <span className="text-[12px] font-semibold text-foreground/70">{tool.label}</span>
                  </div>
                ))}
              </div>
              <div className="relative mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-border pt-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">8+</p>
                  <p className="text-xs font-medium text-muted-foreground">Disconnected tools</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">6 hrs</p>
                  <p className="text-xs font-medium text-muted-foreground">Lost to manual reporting / week</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-xs font-medium text-muted-foreground">Single source of truth</p>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col gap-4">
            {painPoints.map((point, i) => (
              <Reveal key={point.title} delay={i * 0.08} direction="left">
                <PainPointCard point={point} />
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
