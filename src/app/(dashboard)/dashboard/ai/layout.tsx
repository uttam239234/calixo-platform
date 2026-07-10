import type { ReactNode } from "react";
import { CopilotProvider } from "@/features/copilot/CopilotProvider";
import { CopilotCommandPalette } from "@/components/copilot";

export default function AiCopilotLayout({ children }: { children: ReactNode }) {
  return (
    <CopilotProvider>
      {children}
      <CopilotCommandPalette />
    </CopilotProvider>
  );
}
