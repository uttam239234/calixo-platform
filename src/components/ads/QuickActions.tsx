import { ArrowRight, Bot, Cable, FileUp, Plus } from "lucide-react";
import Link from "next/link";

const actions = [
  { title: "Create Campaign", description: "Launch across any channel", icon: Plus, accent: "text-cyan-300 bg-cyan-500/10", href: "/dashboard/ads/campaigns/new" },
  { title: "Import Campaign", description: "Bring in existing campaigns", icon: FileUp, accent: "text-violet-300 bg-violet-500/10" },
  { title: "Connect Platform", description: "Add an advertising account", icon: Cable, accent: "text-blue-300 bg-blue-500/10" },
  { title: "Generate AI Campaign", description: "Build a campaign with Calixo", icon: Bot, accent: "text-fuchsia-300 bg-fuchsia-500/10" },
];

export function QuickActions() {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{actions.map(({ title, description, icon: Icon, accent, href }) => {
    const content = <><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accent}`}><Icon size={20} /></span><span className="min-w-0"><span className="block text-sm font-semibold text-white">{title}</span><span className="mt-1 block truncate text-xs text-slate-500">{description}</span></span><ArrowRight size={16} className="ml-auto shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-300" /></>;
    const className = "group flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/65 p-4 text-left backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:bg-slate-900";
    return href ? <Link key={title} href={href} className={className}>{content}</Link> : <button key={title} type="button" className={className}>{content}</button>;
  })}</div>;
}
