"use client";

import { Bell, ChevronDown, Moon, Search, Sparkles, User } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex flex-1 items-center gap-3 lg:gap-4">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 shadow-inner shadow-cyan-950/20 lg:max-w-xl">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns, insights, automations..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="ml-3 flex items-center gap-2 sm:gap-3 lg:gap-3">
        <button className="hidden rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-500/40 hover:text-white sm:flex sm:items-center sm:gap-2">
          <Sparkles size={16} className="text-cyan-300" />
          AI Copilot
        </button>

        <button className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-slate-300 transition hover:border-cyan-500/40 hover:text-white">
          <Bell size={18} />
        </button>

        <button className="hidden rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-slate-300 transition hover:border-cyan-500/40 hover:text-white md:block">
          <Moon size={18} />
        </button>

        <button className="hidden rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-500/40 hover:text-white lg:flex lg:items-center lg:gap-2">
          Workspace
          <ChevronDown size={16} />
        </button>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
            <User size={18} />
          </div>
          <div className="hidden sm:block">
            <p className="font-semibold text-white">Uttam</p>
            <p className="text-sm text-slate-400">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}