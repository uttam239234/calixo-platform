"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bot, ChevronLeft, ChevronRight, Sparkles, Star } from "lucide-react";
import { navigation } from "@/lib/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("calixo-sidebar-collapsed");
    if (stored === "true") {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("calixo-sidebar-collapsed", collapsed ? "true" : "false");
  }, [collapsed]);

  return (
    <aside className={`flex h-screen flex-col border-r border-slate-800/80 bg-slate-950/95 py-5 transition-all duration-300 ${collapsed ? "w-20" : "w-72"}`}>
      <div className="px-4">
        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-slate-900 p-3">
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300">
              <Bot size={20} />
            </div>
            {!collapsed ? (
              <div>
                <h1 className="text-xl font-semibold text-white">Calixo</h1>
                <p className="text-sm text-slate-400">AI Marketing OS</p>
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="mt-3 flex h-9 w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 transition hover:border-cyan-500/40 hover:text-white"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="mt-6 flex-1 space-y-1.5 px-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.title}
              href={item.href}
              title={item.title}
              className={`flex items-center rounded-2xl px-3 py-3 text-sm font-medium transition-all ${collapsed ? "justify-center" : "gap-3"} ${
                active
                  ? "bg-cyan-500/15 text-cyan-200 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.2)]"
                  : "text-slate-300 hover:bg-slate-800/90 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {!collapsed ? <span>{item.title}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Sparkles size={16} className="text-cyan-300" />
          {!collapsed ? "Proactive growth engine" : "Pro"}
        </div>
        {!collapsed ? (
          <>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300">RG</div>
              <div>
                <p className="font-semibold text-white">Royal Global University</p>
                <p className="text-sm text-slate-400">24 active campaigns</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
              <Star size={14} />
              Premium plan active
            </div>
          </>
        ) : null}
      </div>
    </aside>
  );
}