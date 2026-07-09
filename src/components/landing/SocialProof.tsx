import { Star, Quote } from "lucide-react";
import { Container } from "./shared/Container";
import { SectionHeading } from "./shared/SectionHeading";
import { Reveal } from "./shared/Reveal";

const testimonials = [
  {
    quote: "Calixo replaced nine tools and gave our leadership team a single number everyone actually trusts.",
    name: "Priya Nandakumar",
    title: "VP of Growth Marketing, Meridian Health Systems",
    metric: "+38% pipeline growth in 2 quarters",
    initials: "PN",
  },
  {
    quote: "Our reporting cycle went from three days to three minutes. The AI briefing alone paid for the platform.",
    name: "Daniel Ostrowski",
    title: "CMO, Lattice Financial Group",
    metric: "6 hrs saved per manager, per week",
    initials: "DO",
  },
  {
    quote: "We finally have one AI that understands marketing, sales, and operations — not three different chatbots.",
    name: "Aiko Tanaka",
    title: "Head of RevOps, Nimbus Retail Group",
    metric: "4.6x ROAS within 90 days",
    initials: "AT",
  },
];

const clients = ["Meridian Health Systems", "Lattice Financial", "Nimbus Retail Group", "Horizon University", "Vertex Logistics", "Solace Media Group"];

export default function SocialProof() {
  return (
    <section id="proof" className="relative bg-surface/40 py-24 lg:py-32 scroll-mt-24">
      <Container>
        <SectionHeading badge="Social Proof" title="Growth leaders run their business on Calixo." />

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-7">
                <Quote size={22} className="text-primary/30" />
                <div className="mt-3 flex gap-0.5 text-warning">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={13} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#8B5CF6] text-[12px] font-bold text-white">
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold text-foreground">{t.name}</p>
                    <p className="truncate text-[12px] text-muted-foreground">{t.title}</p>
                  </div>
                </div>
                <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-[12px] font-semibold text-success">
                  {t.metric}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-16 border-t border-border pt-10 text-center">
            <p className="text-[12.5px] font-semibold uppercase tracking-wider text-muted-foreground">Trusted by growth teams at</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {clients.map((client) => (
                <span key={client} className="text-[15px] font-bold tracking-tight text-muted-foreground/60">
                  {client}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
