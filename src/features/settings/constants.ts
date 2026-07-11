/** Calixo Settings - shared dropdown option lists (Organization Profile + Preferences). */

export const INDUSTRY_OPTIONS = [
  "Higher Education",
  "K-12 Education",
  "Software",
  "Marketing Agency",
  "Healthcare",
  "Financial Services",
  "Retail & E-commerce",
  "Manufacturing",
  "Non-profit",
  "Other",
];

export const COMPANY_SIZE_OPTIONS = ["1-10", "11-50", "51-200", "201-1,000", "1,000-5,000", "5,000+"];

export const TIMEZONE_OPTIONS = [
  { id: "UTC", label: "UTC" },
  { id: "America/New_York", label: "Eastern Time (US)" },
  { id: "America/Chicago", label: "Central Time (US)" },
  { id: "America/Denver", label: "Mountain Time (US)" },
  { id: "America/Los_Angeles", label: "Pacific Time (US)" },
  { id: "Europe/London", label: "London" },
  { id: "Europe/Berlin", label: "Central Europe" },
  { id: "Asia/Kolkata", label: "India" },
  { id: "Asia/Singapore", label: "Singapore" },
  { id: "Asia/Tokyo", label: "Tokyo" },
  { id: "Australia/Sydney", label: "Sydney" },
];

export const CURRENCY_OPTIONS = [
  { id: "USD", label: "US Dollar (USD)" },
  { id: "EUR", label: "Euro (EUR)" },
  { id: "GBP", label: "British Pound (GBP)" },
  { id: "INR", label: "Indian Rupee (INR)" },
  { id: "AUD", label: "Australian Dollar (AUD)" },
  { id: "CAD", label: "Canadian Dollar (CAD)" },
  { id: "SGD", label: "Singapore Dollar (SGD)" },
  { id: "JPY", label: "Japanese Yen (JPY)" },
];

export const DATE_FORMAT_OPTIONS = [
  { id: "MMM d, yyyy", label: "Jan 5, 2026" },
  { id: "MM/dd/yyyy", label: "01/05/2026" },
  { id: "dd/MM/yyyy", label: "05/01/2026" },
  { id: "yyyy-MM-dd", label: "2026-01-05" },
];

export const LANGUAGE_OPTIONS = [
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "fr", label: "Français" },
  { id: "de", label: "Deutsch" },
  { id: "pt", label: "Português" },
  { id: "hi", label: "हिन्दी" },
  { id: "ja", label: "日本語" },
  { id: "zh", label: "中文" },
];

export const TIME_FORMAT_OPTIONS: { id: "12h" | "24h"; label: string }[] = [
  { id: "12h", label: "12-hour (2:30 PM)" },
  { id: "24h", label: "24-hour (14:30)" },
];

export const MEASUREMENT_UNIT_OPTIONS: { id: "metric" | "imperial"; label: string }[] = [
  { id: "metric", label: "Metric (km, kg)" },
  { id: "imperial", label: "Imperial (mi, lb)" },
];

export const DIGEST_FREQUENCY_OPTIONS: { id: "daily" | "weekly" | "off"; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "off", label: "Off" },
];

export const DEFAULT_DASHBOARD_OPTIONS = [
  { id: "dashboard", label: "Overview Dashboard" },
  { id: "analytics", label: "Analytics" },
  { id: "reports", label: "Reports" },
  { id: "social", label: "Social Media" },
  { id: "ads", label: "Ads Manager" },
];

export const PASSWORD_POLICY_OPTIONS: { id: "basic" | "strong" | "strict"; label: string; description: string }[] = [
  { id: "basic", label: "Basic", description: "At least 8 characters." },
  { id: "strong", label: "Strong", description: "At least 10 characters, with an uppercase letter and a number." },
  { id: "strict", label: "Strict", description: "At least 12 characters, with an uppercase letter, a number, and a symbol." },
];

export const SESSION_TIMEOUT_OPTIONS = [15, 30, 60, 120, 240, 480];
