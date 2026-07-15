import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/features/theme/ThemeContext";
import { InternalRoleProvider } from "@/features/platform-admin/internalRole";
import "@/core/modules/bootstrap";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calixo - AI Marketing Operating System",
  description: "Premium enterprise AI marketing platform. Campaign management, analytics, and automation powered by artificial intelligence.",
  keywords: "marketing, AI, campaigns, analytics, automation, enterprise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ClerkProvider>
          <ThemeProvider>
            <InternalRoleProvider>{children}</InternalRoleProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}