import { CompetitorDashboard } from "@/components/social/competitors/CompetitorDashboard";
import { CompetitorProvider } from "@/features/social/competitors/CompetitorProvider";

export default function CompetitorsPage() {
  return (
    <CompetitorProvider>
      <CompetitorDashboard />
    </CompetitorProvider>
  );
}