import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Enables next/navigation's forbidden()/unauthorized() + forbidden.tsx/unauthorized.tsx
    // boundaries — used by /platform-admin's layout to return a REAL HTTP 403 for an
    // authenticated-but-unauthorized platform role, not just a client-rendered "Access Denied".
    authInterrupts: true,
  },
  async redirects() {
    return [
      // Content Studio rebuild — old 15-tab IA collapsed into 4 products (AI Assistant, Creative
      // Design Studio, Content Creation Studio, Video Studio). These keep old bookmarks/links
      // from 404ing instead of leaving the retired route folders in place as dead code.
      { source: "/dashboard/content/generator", destination: "/dashboard/content/create", permanent: false },
      { source: "/dashboard/content/editor", destination: "/dashboard/content/create", permanent: false },
      { source: "/dashboard/content/workspace", destination: "/dashboard/content/create", permanent: false },
      { source: "/dashboard/content/templates", destination: "/dashboard/content/create?panel=templates", permanent: false },
      { source: "/dashboard/content/library", destination: "/dashboard/content/create?panel=history", permanent: false },
      { source: "/dashboard/content/seo", destination: "/dashboard/content/create?panel=optimize", permanent: false },
      { source: "/dashboard/content/insights", destination: "/dashboard/content/create?panel=optimize", permanent: false },
      { source: "/dashboard/content/intelligence", destination: "/dashboard/content/create?panel=optimize", permanent: false },
      { source: "/dashboard/content/workflow", destination: "/dashboard/workflows", permanent: false },
      { source: "/dashboard/content/approvals", destination: "/dashboard/workflows", permanent: false },
      { source: "/dashboard/content/calendar", destination: "/dashboard/social/calendar", permanent: false },
      { source: "/dashboard/content/assets", destination: "/dashboard/assets", permanent: false },
      { source: "/dashboard/content/settings", destination: "/dashboard/content", permanent: false },
    ];
  },
};

export default nextConfig;
