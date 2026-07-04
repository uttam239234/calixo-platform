"use client";

import { ContentHeader } from "@/components/content/ContentSharedComponents";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { approvalRequests } from "@/lib/content-data";

const urgencyStyles: Record<string, string> = {
  low: "bg-slate-500/10 text-slate-400",
  medium: "bg-cyan-500/10 text-cyan-400",
  high: "bg-amber-500/10 text-amber-400",
  critical: "bg-red-500/10 text-red-400",
};
const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-400",
  rejected: "bg-red-500/10 text-red-400",
};

export default function ApprovalsPage() {
  return (
    <div className="space-y-6 pb-8">
      <ContentHeader title="Approvals" description={`${approvalRequests.filter(a => a.status === "pending").length} pending requests`} />
      <div className="space-y-3">
        {approvalRequests.map((req) => (
          <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{req.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{req.author} — submitted {new Date(req.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", urgencyStyles[req.urgency])}>{req.urgency}</span>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", statusStyles[req.status])}>{req.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}