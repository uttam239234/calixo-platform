"use client";

import Link from "next/link";
import { Zap, Globe, MessageCircle, Rss, ArrowRight } from "lucide-react";
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
      { label: "Documentation", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Guides", href: "#" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "API Platform", href: "#enterprise" },
      { label: "Connector Platform", href: "#integrations" },
      { label: "Changelog", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Partners", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

export default function MarketingFooter() {
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
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/50 transition-colors hover:border-white/25 hover:text-white"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-[12.5px] font-semibold uppercase tracking-wider text-white/35">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-[13.5px] text-white/55 transition-colors hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[15px] font-semibold text-white">Get product updates</p>
            <p className="mt-1 text-[13px] text-white/40">One email a month. No spam, ever.</p>
          </div>
          <form className="flex w-full max-w-sm items-center gap-2" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="footer-newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-newsletter-email"
              type="email"
              required
              placeholder="you@company.com"
              className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[13.5px] text-white placeholder:text-white/30 outline-none focus:border-white/25"
            />
            <button
              type="submit"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white text-[#0B0D17] transition-transform active:scale-95"
              aria-label="Subscribe"
            >
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-8 text-[13px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Calixo, Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href="#" className="hover:text-white/60">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white/60">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white/60">
              Security
            </a>
            <a href="#" className="hover:text-white/60">
              Status
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
