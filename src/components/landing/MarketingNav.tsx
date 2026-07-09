"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X, ChevronRight } from "lucide-react";
import { Container } from "./shared/Container";

const navLinks = [
  { label: "Platform", href: "#platform" },
  { label: "AI", href: "#ai" },
  { label: "Integrations", href: "#integrations" },
  { label: "Enterprise", href: "#enterprise" },
  { label: "Pricing", href: "#pricing" },
];

export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[200] w-full transition-all duration-300 ${
        scrolled ? "border-b border-white/10 bg-[#0B0D17]/85 backdrop-blur-xl" : "border-b border-transparent bg-transparent"
      }`}
    >
      <Container className="flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Calixo home">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#A78BFA] shadow-md shadow-[#6366F1]/25">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-[19px] font-bold tracking-tight text-white">Calixo</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-[14px] font-medium text-white/60 transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/dashboard" className="text-[14px] font-medium text-white/60 transition-colors hover:text-white">
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-[#0B0D17] shadow-lg shadow-black/10 transition-all hover:bg-white/90 active:scale-95"
          >
            Get Started Free
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-white/10 bg-[#0B0D17] lg:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium text-white/70 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                  <ChevronRight size={16} className="text-white/30" />
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-4">
                <Link href="/dashboard" className="rounded-xl border border-white/10 px-4 py-3 text-center text-[14px] font-semibold text-white">
                  Log in
                </Link>
                <Link href="/dashboard" className="rounded-xl bg-white px-4 py-3 text-center text-[14px] font-semibold text-[#0B0D17]">
                  Get Started Free
                </Link>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
