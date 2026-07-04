"use client";

import { ModuleTabs, type ModuleTab } from "@/components/enterprise/module";
import {
  LayoutDashboard, PenSquare, FileEdit, FileText,
  Library, Calendar, GitBranch, CheckSquare,
  Image, Search, BarChart3, Settings, Palette, Sparkles,
} from "lucide-react";

const navItems: ModuleTab[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard/content", icon: LayoutDashboard },
  { id: "generator", label: "AI Generator", href: "/dashboard/content/generator", icon: PenSquare },
  { id: "editor", label: "Editor", href: "/dashboard/content/editor", icon: FileEdit },
  { id: "templates", label: "Templates", href: "/dashboard/content/templates", icon: FileText },
  { id: "library", label: "Library", href: "/dashboard/content/library", icon: Library },
  { id: "calendar", label: "Calendar", href: "/dashboard/content/calendar", icon: Calendar },
  { id: "workflow", label: "Workflow", href: "/dashboard/content/workflow", icon: GitBranch },
  { id: "approvals", label: "Approvals", href: "/dashboard/content/approvals", icon: CheckSquare },
  { id: "workspace", label: "Workspace", href: "/dashboard/content/workspace", icon: FileEdit },
  { id: "brand-kit", label: "Brand Kit", href: "/dashboard/content/brand-kit", icon: Sparkles },
  { id: "creative", label: "Creative Composer", href: "/dashboard/content/creative", icon: Palette },
  { id: "assets", label: "Assets", href: "/dashboard/content/assets", icon: Image },
  { id: "seo", label: "SEO", href: "/dashboard/content/seo", icon: Search },
  { id: "insights", label: "Insights", href: "/dashboard/content/insights", icon: BarChart3 },
  { id: "settings", label: "Settings", href: "/dashboard/content/settings", icon: Settings },
];

export function ContentSubNav() {
  return <ModuleTabs tabs={navItems} baseUrl="/dashboard/content" className="mb-6" />;
}