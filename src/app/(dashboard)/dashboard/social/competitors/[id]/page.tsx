import { CompetitorDetailPage } from "@/components/social/competitors/CompetitorDetailPage";
import { CompetitorProvider } from "@/features/social/competitors/CompetitorProvider";

export default function CompetitorDetail({ params }: { params: { id: string } }) {
  return (
    <CompetitorProvider>
      <CompetitorDetailPage id={params.id} />
    </CompetitorProvider>
  );
}