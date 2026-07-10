/**
 * Calixo Platform — Content Studio Mock Data
 *
 * A handful of realistic "My Creations" history entries so the history panel isn't empty on
 * first load, plus the AI Assistant's fixed, deterministic question bank.
 */
import type { AssistantQuestion, GenerationHistoryEntry } from "../types";

export const ASSISTANT_QUESTION_BANK: AssistantQuestion[] = [
  {
    id: "channels",
    prompt: "Which channels will you use?",
    options: [
      { id: "instagram", label: "Instagram" },
      { id: "facebook", label: "Facebook" },
      { id: "linkedin", label: "LinkedIn" },
      { id: "whatsapp", label: "WhatsApp" },
      { id: "email", label: "Email" },
    ],
  },
  {
    id: "audience",
    prompt: "Who's it for?",
    options: [
      { id: "prospective-students", label: "Prospective students" },
      { id: "parents", label: "Parents" },
      { id: "working-professionals", label: "Working professionals" },
      { id: "existing-customers", label: "Existing customers" },
    ],
  },
  {
    id: "geography",
    prompt: "Which region?",
    options: [
      { id: "local", label: "Local" },
      { id: "national", label: "National" },
      { id: "global", label: "Global" },
    ],
  },
  {
    id: "needType",
    prompt: "Do you need creative, content, or both?",
    options: [
      { id: "creative", label: "Creative" },
      { id: "content", label: "Content" },
      { id: "both", label: "Both" },
    ],
  },
  {
    id: "tone",
    prompt: "What tone fits best?",
    options: [
      { id: "professional", label: "Professional" },
      { id: "conversational", label: "Conversational" },
      { id: "persuasive", label: "Persuasive" },
      { id: "friendly", label: "Friendly" },
    ],
  },
  {
    id: "cta",
    prompt: "What should people do next?",
    options: [
      { id: "apply-now", label: "Apply Now" },
      { id: "learn-more", label: "Learn More" },
      { id: "book-a-call", label: "Book a Call" },
      { id: "sign-up", label: "Sign Up" },
    ],
  },
];

export function generateSeedHistory(organizationId: string): GenerationHistoryEntry[] {
  const now = Date.now();
  return [
    {
      id: "hist-seed-1",
      kind: "content",
      outputId: "social-caption",
      outputLabel: "Social Captions",
      createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
      organizationId,
      brief: { objective: "Get more leads for our MBA program", audienceName: "Working professionals", tone: "persuasive", cta: "Apply Now", language: "English" },
      primaryText: "🎓 Ready to lead? Our MBA program is built for working professionals who don't have time to slow down.\n\n✨ Flexible weekend classes\n📈 92% career advancement rate\n🤝 A network that opens doors\n\nApply Now — link in bio.",
      shortText: "Ready to lead? Our MBA is built for working professionals. Apply Now.",
      longText: "🎓 Ready to lead? Our MBA program is built for working professionals who don't have time to slow down.\n\n✨ Flexible weekend classes\n📈 92% career advancement rate\n🤝 A network that opens doors\n💼 Taught by industry leaders, not just academics\n\nApply Now — link in bio.",
      hashtags: ["#MBA", "#CareerGrowth", "#AdmissionsOpen"],
      ctaVariations: ["Apply Now", "Start Your Application", "Secure Your Seat"],
    },
    {
      id: "hist-seed-2",
      kind: "creative",
      outputId: "instagram-post",
      outputLabel: "Instagram Post",
      createdAt: new Date(now - 1000 * 60 * 60 * 30).toISOString(),
      organizationId,
      brief: { objective: "Promote scholarship applications", audienceName: "Prospective students", tone: "friendly", cta: "Learn More", language: "English" },
      primaryImageUrl: "https://picsum.photos/seed/content-studio-1/1080/1080",
      variantImageUrls: ["https://picsum.photos/seed/content-studio-1b/1080/1080", "https://picsum.photos/seed/content-studio-1c/1080/1080"],
      platformVersions: [
        { platform: "instagram", imageUrl: "https://picsum.photos/seed/content-studio-1/1080/1080" },
        { platform: "facebook", imageUrl: "https://picsum.photos/seed/content-studio-1/1200/630" },
      ],
    },
  ];
}
