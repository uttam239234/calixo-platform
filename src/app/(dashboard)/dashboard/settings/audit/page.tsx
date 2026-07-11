import { ScrollText } from "lucide-react";
import { ComingSoonSection } from "@/components/settings/ComingSoonSection";

export default function AuditPage() {
  return (
    <ComingSoonSection
      icon={<ScrollText size={28} />}
      title="Audit Logs"
      description="A full, searchable record of every change across your organization. People-level activity already has its own readable timeline in Users & Teams today."
    />
  );
}
