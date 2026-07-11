import type { ReactNode } from "react";
import { ReportsProvider } from "@/features/reports/ReportsProvider";
import { ReportsSubNav } from "@/components/reports/ReportsSubNav";

export default function ReportsLayout({ children }: { children: ReactNode }) {
  return (
    <ReportsProvider>
      <ReportsSubNav />
      {children}
    </ReportsProvider>
  );
}
