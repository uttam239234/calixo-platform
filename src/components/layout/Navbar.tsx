"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-border bg-card/80 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-ai shadow-sm shadow-primary/20">
          <Zap size={18} className="text-white" />
        </div>
        <span className="text-xl font-bold text-foreground">Calixo</span>
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <Link href="/dashboard/analytics" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Analytics
        </Link>
        <Link href="/dashboard/ads" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Ads
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:shadow-md hover:shadow-primary/20 transition-all duration-150 active:scale-95"
        >
          <Zap size={15} />
          Launch App
        </Link>
      </div>
    </nav>
  );
}