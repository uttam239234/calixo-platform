import { Webhook } from "lucide-react";
import { ComingSoonSection } from "@/components/settings/ComingSoonSection";

export default function ApiPage() {
  return (
    <ComingSoonSection
      icon={<Webhook size={28} />}
      title="API & Webhooks"
      description="Issue API keys and configure webhooks for your own integrations. An early, technical version of this already lives in Advanced Settings."
    />
  );
}
