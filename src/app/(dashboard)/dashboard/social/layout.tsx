import { SocialProvider } from "@/features/social/SocialProvider";
import { SocialCommandPalette } from "@/components/social/SocialCommandPalette";

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return (
    <SocialProvider>
      {children}
      <SocialCommandPalette />
    </SocialProvider>
  );
}
