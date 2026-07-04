import { ContentSubNav } from "@/components/content/ContentSubNav";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ContentSubNav />
      {children}
    </div>
  );
}