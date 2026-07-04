/** Calixo Platform — Content Workspace Mock Data (50 documents, 500+ blocks, 20 versions, 30 comments) */

export type BlockType = "heading" | "sub-heading" | "paragraph" | "quote" | "callout" | "checklist" | "bullet-list" | "numbered-list" | "table" | "code" | "cta" | "button" | "image-placeholder" | "video-placeholder" | "divider" | "banner" | "hero-section" | "faq";

export interface ContentBlock {
  id: string; type: BlockType; content: string; level?: number; checked?: boolean; items?: string[];
  bold?: boolean; italic?: boolean; underline?: boolean; align?: "left" | "center" | "right";
  color?: string; highlight?: string;
}

export interface DocumentComment { id: string; blockId: string; author: string; text: string; timestamp: string; resolved: boolean; replies: DocumentComment[]; }

export interface DocumentVersion { id: string; timestamp: string; label: string; snapshot: ContentBlock[]; }

export interface ContentDocument {
  id: string; title: string; blocks: ContentBlock[]; metadata: { author: string; createdAt: string; updatedAt: string; wordCount: number; readingTime: number; tags: string[] };
  seo: { metaTitle: string; metaDescription: string; focusKeyword: string; slug: string };
  comments: DocumentComment[]; versions: DocumentVersion[]; assets: { id: string; name: string; url: string }[];
}

function genId(prefix: string, n: number): string { return `${prefix}-${String(n).padStart(3, '0')}`; }

export const MOCK_DOCUMENTS: ContentDocument[] = Array.from({ length: 50 }, (_, di) => {
  const docId = genId("doc", di + 1);
  const blockCount = 8 + Math.floor(Math.random() * 15);
  const blocks: ContentBlock[] = Array.from({ length: blockCount }, (_, bi) => {
    const types: BlockType[] = ["heading", "sub-heading", "paragraph", "paragraph", "paragraph", "quote", "callout", "checklist", "bullet-list", "numbered-list", "code", "cta", "divider", "faq"];
    const type = bi === 0 ? "heading" : types[Math.floor(Math.random() * types.length)];
    const base: ContentBlock = { id: `${docId}-b${String(bi + 1).padStart(2, '0')}`, type, content: "", align: "left" as const };

    switch (type) {
      case "heading": base.content = `Document ${di + 1} Title`; base.level = 1; break;
      case "sub-heading": base.content = `Section ${bi}`; base.level = 2; break;
      case "paragraph": base.content = `This is paragraph ${bi} of document ${di + 1}. It contains sample enterprise content for demonstrating the workspace capabilities. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`; break;
      case "quote": base.content = "The best marketing doesn't feel like marketing. — Industry Leader"; break;
      case "callout": base.content = "💡 Pro Tip: Always A/B test your CTAs for maximum conversion."; break;
      case "checklist": base.content = "Review content"; base.checked = Math.random() > 0.5; break;
      case "bullet-list": base.items = ["Point one", "Point two", "Point three"]; break;
      case "numbered-list": base.items = ["First step", "Second step", "Third step"]; break;
      case "code": base.content = "function optimizeContent() {\n  return { seo: true, readability: 'high' };\n}"; break;
      case "cta": base.content = "Get Started Free →"; break;
      case "divider": base.content = ""; break;
      case "faq": base.content = "Q: What is the workspace?\nA: An enterprise content creation environment."; break;
    }
    return base;
  });

  const comments: DocumentComment[] = Array.from({ length: Math.floor(Math.random() * 3) }, (_, ci) => ({
    id: `${docId}-c${ci + 1}`, blockId: blocks[Math.floor(Math.random() * blocks.length)]?.id ?? "", author: ["Sarah Chen", "Marcus Rivera", "Emily Park"][ci % 3],
    text: ["Can we make this more benefit-driven?", "Looks great! Approved.", "Add a statistic here for credibility."][ci % 3],
    timestamp: new Date(2025, 6, 1 + ci).toISOString(), resolved: ci > 0, replies: [],
  }));

  const versions: DocumentVersion[] = Array.from({ length: Math.floor(Math.random() * 2) + 1 }, (_, vi) => ({
    id: `${docId}-v${vi + 1}`, timestamp: new Date(2025, 6, 1 + vi).toISOString(),
    label: vi === 0 ? "Initial draft" : `AI rewrite v${vi}`,
    snapshot: blocks.slice(0, blocks.length - vi),
  }));

  return {
    id: docId, title: [`Enterprise SEO Guide 2025`, `Social Media Strategy Playbook`, `Q3 Campaign Brief`, `Product Launch Press Release`, `Email Newsletter v42`, `Landing Page Copy Draft`, `Brand Voice Guidelines`, `Content Calendar Template`, `Ad Copy Collection`, `Blog Post - AI Trends`][di % 10] + (di >= 10 ? ` (${Math.floor(di / 10) + 1})` : ""),
    blocks, metadata: { author: ["Sarah Chen", "Marcus Rivera", "Emily Park", "David Kim"][di % 4], createdAt: new Date(2025, 5, 1 + di).toISOString(), updatedAt: new Date(2025, 6, 1).toISOString(), wordCount: 300 + Math.floor(Math.random() * 1500), readingTime: 2 + Math.floor(Math.random() * 8), tags: ["enterprise", "content", "marketing"] },
    seo: { metaTitle: `Document ${di + 1} - Enterprise Content`, metaDescription: `Professional content document ${di + 1}`, focusKeyword: "enterprise content", slug: `doc-${di + 1}` },
    comments, versions, assets: [{ id: `${docId}-a1`, name: "hero-image.jpg", url: "/assets/hero.jpg" }],
  };
});

export const MOCK_COLLABORATORS = ["Sarah Chen", "Marcus Rivera", "Emily Park", "David Kim", "Jessica Taylor", "Ryan O'Brien", "Priya Sharma", "Alex Wong"];