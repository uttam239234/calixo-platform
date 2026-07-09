import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Container } from "./shared/Container";
import { Reveal } from "./shared/Reveal";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#0B0D17] py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#4F46E5]/30 via-[#8B5CF6]/20 to-[#3B82F6]/20 blur-[130px]" />
      </div>

      <Container className="relative flex flex-col items-center text-center">
        <Reveal>
          <h2 className="max-w-3xl text-[32px] font-bold leading-[1.15] tracking-tight text-white sm:text-[44px]">
            Ready to transform how your business grows?
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/60">
            Join the growth teams running marketing, sales, analytics, and automation on one intelligent operating
            system.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
            <Link
              href="/dashboard"
              className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-[#0B0D17] shadow-xl shadow-black/20 transition-all hover:bg-white/90 active:scale-[0.98]"
            >
              Get Started Free
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#platform"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 text-[15px] font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/[0.08] active:scale-[0.98]"
            >
              <PlayCircle size={17} />
              Book a Demo
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.28}>
          <p className="mt-7 text-[13px] font-medium text-white/35">
            Free 14-day trial · No credit card required · Enterprise ready
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
