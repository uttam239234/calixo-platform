/**
 * Calixo Platform - Clerk theming bridge
 *
 * Maps Clerk's prebuilt components onto Calixo's own CSS custom properties
 * (`src/app/globals.css`) via `var(...)` references rather than a separate
 * light/dark Clerk theme object — Clerk's `variables` accept any CSS color
 * string, so this automatically tracks whichever theme (light/dark/system)
 * `ThemeProvider` currently has applied, with no duplicate theme logic.
 */
export const CLERK_APPEARANCE = {
  variables: {
    colorPrimary: "var(--primary)",
    colorBackground: "var(--card)",
    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    colorInputBackground: "var(--background)",
    colorInputText: "var(--foreground)",
    colorNeutral: "var(--foreground)",
    colorDanger: "var(--destructive)",
    colorSuccess: "var(--success)",
    borderRadius: "0.75rem",
  },
  elements: {
    card: "shadow-2xl border border-[var(--border)]",
    headerTitle: "text-[var(--foreground)]",
    headerSubtitle: "text-[var(--muted-foreground)]",
    socialButtonsBlockButton: "border border-[var(--border)]",
    dividerLine: "bg-[var(--border)]",
    footerActionLink: "text-[var(--primary)]",
  },
};
