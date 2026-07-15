import { SocialProvider } from "@/features/social/SocialProvider";
import { SocialCommandPalette } from "@/components/social/SocialCommandPalette";
import { requireModuleAccess } from "../requireModuleAccess";
import { EntitlementDeniedState } from "@/components/enterprise/module/EntitlementDeniedState";

export default async function SocialLayout({ children }: { children: React.ReactNode }) {
  const { allowed, result } = await requireModuleAccess("social");
  if (!allowed) return <EntitlementDeniedState moduleLabel="Social Media" result={result} />;

  return (
    <SocialProvider>
      {children}
      <SocialCommandPalette />
    </SocialProvider>
  );
}
