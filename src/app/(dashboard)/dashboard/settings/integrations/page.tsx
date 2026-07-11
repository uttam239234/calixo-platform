import { Link2 } from "lucide-react";
import { ComingSoonSection } from "@/components/settings/ComingSoonSection";

export default function IntegrationsPage() {
  return (
    <ComingSoonSection
      icon={<Link2 size={28} />}
      title="Integrations"
      description="Connect the tools your organization already uses. Advanced Settings has an early, technical version of this today — this will become its polished home."
    />
  );
}
