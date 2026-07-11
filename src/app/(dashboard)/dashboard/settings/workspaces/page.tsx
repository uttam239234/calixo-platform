import { Boxes } from "lucide-react";
import { ComingSoonSection } from "@/components/settings/ComingSoonSection";

export default function WorkspacesPage() {
  return (
    <ComingSoonSection
      icon={<Boxes size={28} />}
      title="Workspaces"
      description="Organize your organization into separate work areas, each with its own campaigns, content, and reporting."
    />
  );
}
