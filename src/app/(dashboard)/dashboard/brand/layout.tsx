import { BrandSubNav } from "@/components/brand/BrandSubNav";

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <BrandSubNav />
      {children}
    </div>
  );
}