import {
  LayoutDashboard,
  BarChart3,
  Megaphone,
  Share2,
  ShieldCheck,
  PenSquare,
  Bot,
  FileText,
  Settings,
  UserCog,
  UserPlus,
  Building2,
  Link2,
  CreditCard,
  ScrollText,
  Webhook,
} from "lucide-react";

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

export const navigation: NavSection[] = [
  {
    title: "MAIN MODULES",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { title: "Ads Manager", href: "/dashboard/ads", icon: Megaphone },
      { title: "Social Media", href: "/dashboard/social", icon: Share2 },
      { title: "Brand Monitoring", href: "/dashboard/brand", icon: ShieldCheck },
      { title: "Content Studio", href: "/dashboard/content", icon: PenSquare },
      { title: "AI Copilot", href: "/dashboard/ai", icon: Bot, badge: "New" },
      { title: "Reports", href: "/dashboard/reports", icon: FileText },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
      { title: "Users & Teams", href: "/dashboard/users", icon: UserCog },
      { title: "Roles & Permissions", href: "/dashboard/roles", icon: UserPlus },
      { title: "Workspaces", href: "/dashboard/workspaces", icon: Building2 },
      { title: "Integrations", href: "/dashboard/integrations", icon: Link2 },
      { title: "Billing & Plans", href: "/dashboard/billing", icon: CreditCard },
      { title: "Audit Logs", href: "/dashboard/audit", icon: ScrollText },
      { title: "API & Webhooks", href: "/dashboard/api", icon: Webhook },
    ],
  },
];