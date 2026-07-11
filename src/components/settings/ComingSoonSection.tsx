import type { ReactNode } from "react";
import { ModuleEmptyState } from "@/components/enterprise/module";

interface ComingSoonSectionProps {
  icon: ReactNode;
  title: string;
  description: string;
}

/** Honest placeholder for the 5 shell sections not built out this phase — no fake data, no dead controls. */
export function ComingSoonSection({ icon, title, description }: ComingSoonSectionProps) {
  return (
    <div className="rounded-3xl border border-border bg-card">
      <ModuleEmptyState icon={icon} title={`${title} is coming soon`} description={description} />
    </div>
  );
}
