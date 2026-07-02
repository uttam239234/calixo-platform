import {
  LayoutDashboard,
  BarChart3,
  Megaphone,
  Share2,
  ShieldCheck,
  PenSquare,
  Bot,
  Zap,
  Users,
  CreditCard,
  Settings,
} from "lucide-react";

export const navigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Ads Manager",
    href: "/dashboard/ads",
    icon: Megaphone,
  },
  {
    title: "Social Media",
    href: "/dashboard/social",
    icon: Share2,
  },
  {
    title: "Brand Monitoring",
    href: "/dashboard/brand",
    icon: ShieldCheck,
  },
  {
    title: "Content Studio",
    href: "/dashboard/content",
    icon: PenSquare,
  },
  {
    title: "AI Copilot",
    href: "/dashboard/ai",
    icon: Bot,
  },
  {
    title: "Automation",
    href: "/dashboard/automation",
    icon: Zap,
  },
  {
    title: "Team",
    href: "/dashboard/team",
    icon: Users,
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];