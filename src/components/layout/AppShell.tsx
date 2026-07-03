"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className="hidden md:flex fixed md:relative z-40 h-screen flex-col transition-all duration-300 ease-in-out"
        style={{ width: sidebarCollapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width)" }}
        aria-label="Sidebar"
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden w-full min-w-0">
        {/* Sticky Header */}
        <Header />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin bg-background">
          <div
            className="mx-auto"
            style={{
              padding: "var(--content-padding)",
              maxWidth: "var(--content-max-width)",
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}