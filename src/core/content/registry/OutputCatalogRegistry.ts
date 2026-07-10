/**
 * Calixo Platform — Output Catalog Registry
 *
 * The canonical mapping from the brief's 16 jargon-free creative outputs and 13 jargon-free
 * content outputs to the real underlying `CreativeType`/`CreativePlatform` (core/creative) and
 * `ContentTypeOption`/`Platform` (core/ai) enums. This is the ONLY place Content Studio's UI
 * needs to know about — it never touches the underlying engine enums directly.
 */
import type { CreativeOutputCatalogEntry, ContentOutputCatalogEntry, CreativeOutputKind, ContentOutputKind } from "../types";

const CREATIVE_CATALOG: CreativeOutputCatalogEntry[] = [
  { id: "instagram-post", label: "Instagram Post", description: "A single-image feed post sized for Instagram", group: "Social", creativeType: "social-post", platform: "instagram" },
  { id: "instagram-story", label: "Instagram Story", description: "Full-screen vertical story", group: "Social", creativeType: "story", platform: "instagram" },
  { id: "facebook-post", label: "Facebook Post", description: "A single-image feed post sized for Facebook", group: "Social", creativeType: "social-post", platform: "facebook" },
  { id: "facebook-carousel", label: "Facebook Carousel", description: "A multi-slide swipeable carousel for Facebook", group: "Social", creativeType: "carousel", platform: "facebook" },
  { id: "linkedin-post", label: "LinkedIn Post", description: "A single-image feed post sized for LinkedIn", group: "Social", creativeType: "social-post", platform: "linkedin" },
  { id: "linkedin-carousel", label: "LinkedIn Carousel", description: "A multi-slide document/carousel post for LinkedIn", group: "Social", creativeType: "carousel", platform: "linkedin" },
  { id: "google-display-ad", label: "Google Display Ads", description: "A responsive display banner for the Google Display Network", group: "Ads", creativeType: "display-banner", platform: "google-display" },
  { id: "google-pmax-assets", label: "Google PMax Assets", description: "A multi-ratio asset set for Google Performance Max", group: "Ads", creativeType: "pmax-asset-set", platform: "performance-max", assetSetSize: 3 },
  { id: "whatsapp-creative", label: "WhatsApp Creative", description: "A square broadcast image for WhatsApp campaigns", group: "Messaging", creativeType: "social-post", platform: "whatsapp" },
  { id: "banner-ad", label: "Banner Ads", description: "A general-purpose web banner ad", group: "Ads", creativeType: "display-banner", platform: "google-display" },
  { id: "email-header", label: "Email Header", description: "A header image for an email newsletter or campaign", group: "Messaging", creativeType: "email-header", platform: "email" },
  { id: "flyer", label: "Flyer", description: "A promotional flyer", group: "Print & Events", creativeType: "flyer", platform: "print" },
  { id: "poster", label: "Poster", description: "A print or digital poster", group: "Print & Events", creativeType: "poster", platform: "print" },
  { id: "brochure", label: "Brochure", description: "A tri-fold or bi-fold brochure", group: "Print & Events", creativeType: "brochure", platform: "print" },
  { id: "event-banner", label: "Event Banner", description: "A social/display graphic promoting an event or webinar", group: "Print & Events", creativeType: "event-banner", platform: "facebook" },
  { id: "custom-size", label: "Custom Size", description: "Any size you need — set your own dimensions in Advanced Mode", group: "Custom", creativeType: "custom-size", platform: "instagram" },
];

const CONTENT_CATALOG: ContentOutputCatalogEntry[] = [
  { id: "social-caption", label: "Social Captions", description: "A caption for an Instagram/Facebook/LinkedIn post", group: "Social", contentType: "instagram-caption", platform: "instagram", defaultLength: "short" },
  { id: "ad-copy", label: "Ad Copy", description: "Copy for a Meta or Google ad", group: "Ads", contentType: "meta-ad", platform: "facebook", defaultLength: "short" },
  { id: "headline", label: "Headlines", description: "A short, high-impact headline", group: "Ads", contentType: "headline", platform: "landing-page", defaultLength: "short" },
  { id: "blog", label: "Blogs", description: "A full-length blog article", group: "Long-form", contentType: "blog-article", platform: "blog", defaultLength: "long" },
  { id: "email", label: "Emails", description: "A marketing or newsletter email", group: "Messaging", contentType: "email", platform: "email", defaultLength: "medium" },
  { id: "whatsapp-campaign", label: "WhatsApp Campaigns", description: "A WhatsApp broadcast message", group: "Messaging", contentType: "whatsapp-campaign", platform: "whatsapp", defaultLength: "short" },
  { id: "sms", label: "SMS", description: "A short SMS message", group: "Messaging", contentType: "sms", platform: "sms", defaultLength: "short" },
  { id: "landing-page", label: "Landing Pages", description: "Landing page copy: headline, subheadline, and body", group: "Long-form", contentType: "landing-page", platform: "landing-page", defaultLength: "medium" },
  { id: "brochure-copy", label: "Brochures", description: "Copy for a print brochure", group: "Print & Events", contentType: "brochure-copy", platform: "brochure", defaultLength: "medium" },
  { id: "press-release", label: "Press Releases", description: "A formal press release", group: "Long-form", contentType: "press-release", platform: "blog", defaultLength: "medium" },
  { id: "video-script", label: "Video Scripts", description: "A short-form video script", group: "Social", contentType: "video-script", platform: "instagram", defaultLength: "short" },
  { id: "product-description", label: "Product Descriptions", description: "A product or service description", group: "Sales", contentType: "product-description", platform: "landing-page", defaultLength: "short" },
  { id: "case-study", label: "Case Studies", description: "A customer success case study", group: "Sales", contentType: "case-study", platform: "blog", defaultLength: "long" },
];

export const OutputCatalogRegistry = {
  listCreative(): CreativeOutputCatalogEntry[] {
    return [...CREATIVE_CATALOG];
  },
  listContent(): ContentOutputCatalogEntry[] {
    return [...CONTENT_CATALOG];
  },
  getCreative(id: CreativeOutputKind): CreativeOutputCatalogEntry | undefined {
    return CREATIVE_CATALOG.find(entry => entry.id === id);
  },
  getContent(id: ContentOutputKind): ContentOutputCatalogEntry | undefined {
    return CONTENT_CATALOG.find(entry => entry.id === id);
  },
};
