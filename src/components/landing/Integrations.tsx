import { Container } from "./shared/Container";
import { SectionHeading } from "./shared/SectionHeading";
import { Reveal } from "./shared/Reveal";

const integrations = [
  { name: "Google Analytics", mark: "GA", color: "bg-[#F9AB00]" },
  { name: "Google Ads", mark: "Ads", color: "bg-[#4285F4]" },
  { name: "Search Console", mark: "GSC", color: "bg-[#34A853]" },
  { name: "Meta Ads", mark: "M", color: "bg-[#0866FF]" },
  { name: "LinkedIn", mark: "in", color: "bg-[#0A66C2]" },
  { name: "Slack", mark: "#", color: "bg-[#611F69]" },
  { name: "Microsoft 365", mark: "MS", color: "bg-[#0078D4]" },
  { name: "WordPress", mark: "W", color: "bg-[#21759B]" },
  { name: "Shopify", mark: "S", color: "bg-[#95BF47]" },
  { name: "HubSpot", mark: "H", color: "bg-[#FF7A59]" },
];

const integrationsRow2 = [
  { name: "Salesforce", mark: "SF", color: "bg-[#00A1E0]" },
  { name: "OpenAI", mark: "AI", color: "bg-[#10A37F]" },
  { name: "Claude", mark: "C", color: "bg-[#D97757]" },
  { name: "Gemini", mark: "G", color: "bg-[#8E75F0]" },
  { name: "Stripe", mark: "$", color: "bg-[#635BFF]" },
  { name: "Razorpay", mark: "R", color: "bg-[#0C2451]" },
  { name: "Mailchimp", mark: "MC", color: "bg-[#FFE01B] text-[#0B0D17]" },
  { name: "Zapier", mark: "Z", color: "bg-[#FF4A00]" },
  { name: "Notion", mark: "N", color: "bg-[#0B0D17]" },
  { name: "Twilio", mark: "T", color: "bg-[#F22F46]" },
];

function LogoChip({ item }: { item: { name: string; mark: string; color: string } }) {
  return (
    <div className="flex flex-shrink-0 items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3.5 shadow-sm">
      <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white ${item.color}`}>
        {item.mark}
      </span>
      <span className="whitespace-nowrap text-[14px] font-semibold text-foreground">{item.name}</span>
    </div>
  );
}

function MarqueeRow({ items, direction }: { items: typeof integrations; direction: "left" | "right" }) {
  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className={`marquee-row flex w-max gap-4 ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}>
        {[...items, ...items].map((item, i) => (
          <LogoChip key={`${item.name}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function Integrations() {
  return (
    <section id="integrations" className="relative bg-background py-24 lg:py-32 scroll-mt-24">
      <Container>
        <SectionHeading
          badge="Connect Everything"
          title="100+ integrations. Zero busywork."
          subtitle="Calixo plugs directly into the tools you already use — so your data flows in automatically instead of living in exports and spreadsheets."
        />
      </Container>

      <Reveal delay={0.1}>
        <div className="mt-14 flex flex-col gap-4">
          <MarqueeRow items={integrations} direction="left" />
          <MarqueeRow items={integrationsRow2} direction="right" />
        </div>
      </Reveal>

      <Container>
        <p className="mt-10 text-center text-[13.5px] text-muted-foreground">
          + Twitter/X, Instagram, YouTube, TikTok, Pinterest, Google My Business, Amazon Ads, Klaviyo, Zoom, Asana and 80+ more.
        </p>
      </Container>
    </section>
  );
}
