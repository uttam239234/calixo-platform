import Link from "next/link";
import {
  LayoutDashboard,
  BarChart3,
  Megaphone,
  Share2,
  PenSquare,
  Radar,
  FileBarChart,
  Workflow,
  Bot,
  FolderOpen,
  Users,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Container } from "./shared/Container";
import { SectionHeading } from "./shared/SectionHeading";
import { Reveal } from "./shared/Reveal";

const modules = [
  { icon: LayoutDashboard, title: "Dashboard", description: "Every KPI, goal, and workflow in one command center — customizable to how you run growth.", href: "/dashboard" },
  { icon: BarChart3, title: "Analytics", description: "Real-time performance across every channel, with AI explaining why the numbers moved.", href: "/dashboard/analytics" },
  { icon: Megaphone, title: "Ads Manager", description: "Plan, launch, and optimize Google and Meta campaigns without leaving Calixo.", href: "/dashboard/ads" },
  { icon: Share2, title: "Social Media", description: "Schedule, publish, and monitor every social channel from a single calendar.", href: "/dashboard/social" },
  { icon: PenSquare, title: "Content Studio", description: "Generate on-brand content, manage SEO, and run approvals in one workspace.", href: "/dashboard/content" },
  { icon: Radar, title: "Brand Monitoring", description: "Track mentions, sentiment, and competitors in real time, wherever they happen.", href: "/dashboard/brand" },
  { icon: FileBarChart, title: "Reports", description: "Executive-ready reporting that builds itself, scheduled straight to stakeholders.", href: "/dashboard/reports" },
  { icon: Workflow, title: "Workflow & Automation", description: "Automate the busywork across every module with visual, no-code workflows.", href: "/dashboard/workflows" },
  { icon: Bot, title: "AI Copilot", description: "One AI that understands your entire business and can act across every module.", href: "/dashboard/ai" },
  { icon: FolderOpen, title: "Assets & Library", description: "A single home for every brand asset, creative, and content file your team ships.", href: "/dashboard/assets" },
  { icon: Users, title: "Users & Teams", description: "Manage roles, permissions, and collaboration across your whole organization.", href: "/dashboard/settings/users" },
  { icon: Settings, title: "Settings & Administration", description: "Enterprise controls for security, billing, and configuration — all in one place.", href: "/dashboard/settings" },
];

export default function PlatformGrid() {
  return (
    <section id="platform" className="relative bg-background py-24 lg:py-32 scroll-mt-24">
      <Container>
        <SectionHeading
          badge="The Platform"
          title="Everything you need to grow."
          subtitle="Not a bundle of separate products stitched together — one connected ecosystem where every module shares the same data, the same AI, and the same login."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map((module, i) => (
            <Reveal key={module.title} delay={(i % 4) * 0.06}>
              <Link href={module.href} className="block h-full">
                <Card hoverable className="group h-full">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#8B5CF6] text-white shadow-sm shadow-primary/20">
                    <module.icon size={20} />
                  </div>
                  <h3 className="mt-4 text-[16px] font-semibold text-foreground">{module.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{module.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Explore module <ArrowUpRight size={13} />
                  </span>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
