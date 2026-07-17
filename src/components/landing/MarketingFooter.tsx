"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Globe, MessageCircle, Rss, ArrowRight, Loader2 } from "lucide-react";
import { Container } from "./shared/Container";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Dashboard", href: "#platform" },
      { label: "Analytics", href: "#platform" },
      { label: "AI Copilot", href: "#ai" },
      { label: "Automation", href: "#platform" },
      { label: "Integrations", href: "#integrations" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Enterprise", href: "#enterprise" },
      { label: "Marketing Teams", href: "#platform" },
      { label: "Sales & CRM", href: "#platform" },
      { label: "Agencies", href: "#results" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Customer Stories", href: "#proof" },
      { label: "Documentation", href: "#soon" },
      { label: "Blog", href: "#soon" },
      { label: "Guides", href: "#soon" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "API Platform", href: "#enterprise" },
      { label: "Connector Platform", href: "#integrations" },
      { label: "Changelog", href: "#soon" },
      { label: "Status", href: "#soon" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#soon" },
      { label: "Careers", href: "#soon" },
      { label: "Partners", href: "#soon" },
      { label: "Contact", href: "mailto:sales@calixo.io" },
    ],
  },
];

export default function MarketingFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setMessage("Thanks — you're subscribed.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <footer className="border-t border-white/10 bg-[#0B0D17]">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(5,1fr)]">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5" aria-label="Calixo home">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#A78BFA]">
                <Zap size={18} className="text-white" />
              </div>
              <span className="text-[19px] font-bold tracking-tight text-white">Calixo</span>
            </Link>
            <p className="mt-4 text-[13.5px] leading-relaxed text-white/40">
              The Enterprise AI Growth Operating System — unifying marketing, sales, analytics, and automation into one intelligent platform.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Globe, MessageCircle, Rss].map((Icon, i) => (
                <span
                  key={i}
                  aria-label="Social link coming soon"
                  title="Coming soon"
                  className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-xl border border-white/10 text-white/25"
                >
                  <Icon size={15} />
                </span>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-[12.5px] font-semibold uppercase tracking-wider text-white/35">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href === "#soon" ? (
                      <span className="inline-flex items-center gap-1.5 text-[13.5px] text-white/30">
                        {link.label}
                        <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/30">Soon</span>
                      </span>
                    ) : (
                      <a href={link.href} className="text-[13.5px] text-white/55 transition-colors hover:text-white">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[15px] font-semibold text-white">Get product updates</p>
            <p className="mt-1 text-[13px] text-white/40">
              {status === "success" ? message : status === "error" ? message : "One email a month. No spam, ever."}
            </p>
          </div>
          <form className="flex w-full max-w-sm items-center gap-2" onSubmit={handleSubscribe}>
            <label htmlFor="footer-newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              disabled={status === "loading"}
              className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[13.5px] text-white placeholder:text-white/30 outline-none focus:border-white/25 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white text-[#0B0D17] transition-transform active:scale-95 disabled:opacity-60"
              aria-label="Subscribe"
            >
              {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            </button>
          </form>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-8 text-[13px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Calixo, Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {["Privacy Policy", "Terms of Service", "Security", "Status"].map((label) => (
              <span key={label} title="Coming soon" className="cursor-not-allowed text-white/20">
                {label}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
