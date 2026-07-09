"use client";

import { motion } from "framer-motion";
import { Plug, Search, Workflow, Rocket } from "lucide-react";
import { Container } from "./shared/Container";
import { SectionHeading } from "./shared/SectionHeading";
import { Reveal } from "./shared/Reveal";

const steps = [
  { icon: Plug, title: "Connect", description: "Link your CRM, ad accounts, analytics, and content tools in minutes with 100+ native integrations." },
  { icon: Search, title: "Analyze", description: "Calixo's AI unifies your data and surfaces the insights that actually move the needle." },
  { icon: Workflow, title: "Automate", description: "Turn insight into action with AI agents and workflows that run without manual effort." },
  { icon: Rocket, title: "Grow", description: "Watch performance compound as every team works from one intelligent system." },
];

export default function HowItWorks() {
  return (
    <section className="relative bg-surface/40 py-24 lg:py-32">
      <Container>
        <SectionHeading badge="How Calixo Works" title="From scattered tools to compounding growth." />

        <div className="relative mt-20">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-border lg:block" />
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "left" }}
            className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-primary via-[#8B5CF6] to-primary lg:block"
          />

          <div className="grid gap-10 lg:grid-cols-4 lg:gap-8">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.12}>
                <div className="relative flex flex-col items-start lg:items-center lg:text-center">
                  <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#8B5CF6] text-white shadow-lg shadow-primary/25">
                    <step.icon size={20} />
                  </div>
                  <span className="mt-4 text-[13px] font-bold uppercase tracking-wider text-primary">Step {i + 1}</span>
                  <h3 className="mt-1.5 text-[19px] font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 max-w-[240px] text-[14px] leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
