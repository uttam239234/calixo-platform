"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles, Check } from "lucide-react";
import { Container } from "./shared/Container";
import { ProductScreenshot } from "./shared/ProductScreenshot";

const trustItems = ["Free 14-day trial", "No credit card required", "Enterprise ready"];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0B0D17] pb-28 pt-16 sm:pt-20 lg:pb-36 lg:pt-24">
      {/* Ambient gradient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-320px] h-[640px] w-[900px] -translate-x-1/2 rounded-full bg-[#4F46E5]/25 blur-[140px]" />
        <div className="absolute right-[-200px] top-[280px] h-[480px] w-[480px] rounded-full bg-[#8B5CF6]/15 blur-[130px]" />
        <div className="absolute left-[-160px] top-[420px] h-[380px] w-[380px] rounded-full bg-[#3B82F6]/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <Container className="relative">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1fr] lg:gap-12 xl:gap-20">
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-[13px] font-semibold tracking-wide text-white/80 backdrop-blur-xl"
            >
              <Sparkles size={13} className="text-[#A78BFA]" />
              The Enterprise AI Growth Operating System
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="mt-7 text-[40px] font-bold leading-[1.08] tracking-tight text-white sm:text-[52px] lg:text-[58px]"
            >
              One Platform.
              <br />
              Every Growth Function.
              <br />
              <span className="bg-gradient-to-r from-[#818CF8] via-[#A78BFA] to-[#60A5FA] bg-clip-text text-transparent">
                Powered by AI.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/60 sm:text-[18px]"
            >
              Calixo unifies your marketing, sales, CRM, analytics, reporting, automation, AI and operations into one
              intelligent platform that helps your organization grow faster.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="mt-9 flex flex-col gap-3.5 sm:flex-row"
            >
              <Link
                href="/dashboard"
                className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-[#0B0D17] shadow-xl shadow-black/20 transition-all hover:bg-white/90 active:scale-[0.98]"
              >
                Get Started Free
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="mailto:sales@calixo.io?subject=Demo%20Request"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 text-[15px] font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/[0.08] active:scale-[0.98]"
              >
                <PlayCircle size={17} />
                Book a Demo
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.34 }}
              className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2.5"
            >
              {trustItems.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-white/45">
                  <Check size={14} className="text-[#34D399]" />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>

          <div className="relative">
            <ProductScreenshot />
          </div>
        </div>
      </Container>
    </section>
  );
}
