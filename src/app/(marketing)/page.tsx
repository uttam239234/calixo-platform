import type { Metadata } from "next";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Solution from "@/components/landing/Solution";
import PlatformGrid from "@/components/landing/PlatformGrid";
import AIEverywhere from "@/components/landing/AIEverywhere";
import Integrations from "@/components/landing/Integrations";
import HowItWorks from "@/components/landing/HowItWorks";
import WhyCalixo from "@/components/landing/WhyCalixo";
import EnterpriseCapabilities from "@/components/landing/EnterpriseCapabilities";
import Results from "@/components/landing/Results";
import SocialProof from "@/components/landing/SocialProof";
import PricingPreview from "@/components/landing/PricingPreview";
import FinalCTA from "@/components/landing/FinalCTA";

// PricingPreview reads live Platform Admin pricing config (Round 21) — this
// route must not be statically prerendered, or a Platform Admin's price
// change would only ever reach the landing page on the next `next build`,
// contradicting "no redeploy required."
export const dynamic = "force-dynamic";

const title = "Calixo | The Enterprise AI Growth Operating System";
const description =
  "Calixo unifies marketing, sales, CRM, analytics, reporting, automation, and AI into one intelligent platform. Replace 15 disconnected tools with one enterprise growth operating system.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Enterprise AI Growth Platform",
    "AI Growth Operating System",
    "Marketing Automation",
    "CRM",
    "Business Growth Software",
    "Enterprise Analytics",
    "Marketing Platform",
    "AI Platform",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "Calixo",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Calixo",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description,
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "49",
    highPrice: "149",
    priceCurrency: "USD",
    offerCount: "3",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "128",
  },
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <Problem />
      <Solution />
      <PlatformGrid />
      <AIEverywhere />
      <Integrations />
      <HowItWorks />
      <WhyCalixo />
      <EnterpriseCapabilities />
      <Results />
      <SocialProof />
      <PricingPreview />
      <FinalCTA />
    </>
  );
}
