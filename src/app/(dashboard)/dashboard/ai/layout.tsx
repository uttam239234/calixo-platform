import type { ReactNode } from "react";
import { CopilotProvider } from "@/features/copilot/CopilotProvider";
import { CopilotCommandPalette } from "@/components/copilot";
import { requireModuleAccess } from "../requireModuleAccess";
import { EntitlementDeniedState } from "@/components/enterprise/module/EntitlementDeniedState";

export default async function AiCopilotLayout({ children }: { children: ReactNode }) {
  const { allowed, result } = await requireModuleAccess("ai-copilot");
  if (!allowed) return <EntitlementDeniedState moduleLabel="AI Copilot" result={result} />;

  return (
    <CopilotProvider>
      {children}
      <CopilotCommandPalette />
    </CopilotProvider>
  );
}
