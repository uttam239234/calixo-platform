import { ContentSubNav } from "@/components/content/ContentSubNav";
import { ContentCommandPalette } from "@/components/content/ContentCommandPalette";
import { ContentStudioProvider } from "@/features/content/ContentStudioProvider";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ContentStudioProvider>
      <div>
        <ContentSubNav />
        {children}
      </div>
      <ContentCommandPalette />
    </ContentStudioProvider>
  );
}
