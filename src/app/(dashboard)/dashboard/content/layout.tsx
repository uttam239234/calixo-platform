import { ContentSubNav } from "@/components/content/ContentSubNav";
import { ContentCommandPalette } from "@/components/content/ContentCommandPalette";
import { ContentStudioProvider } from "@/features/content/ContentStudioProvider";
import { requireModuleAccess } from "../requireModuleAccess";
import { EntitlementDeniedState } from "@/components/enterprise/module/EntitlementDeniedState";

export default async function ContentLayout({ children }: { children: React.ReactNode }) {
  const { allowed, result } = await requireModuleAccess("content");
  if (!allowed) return <EntitlementDeniedState moduleLabel="Content Studio" result={result} />;

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
