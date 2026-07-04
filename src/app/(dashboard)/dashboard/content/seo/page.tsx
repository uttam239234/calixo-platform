"use client";

import { ContentHeader } from "@/components/content/ContentSharedComponents";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { seoReports } from "@/lib/content-data";
import { Search, TrendingUp } from "lucide-react";

export default function SEOPage() {
  return (
    <div className="space-y-6 pb-8">
      <ContentHeader title="SEO Insights" description="Search engine optimization reports and suggestions" />
      <div className="grid gap-4 sm:grid-cols-2">
        {seoReports.map((report) => (
          <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader title={report.title} description={`Score: ${report.score}/100`} />
              <CardContent>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {report.keywords.map((kw) => (
                    <span key={kw} className="text-[10px] bg-slate-800/50 text-slate-400 px-2 py-0.5 rounded-full">{kw}</span>
                  ))}
                </div>
                <p className="text-xs text-slate-500">{report.suggestions} suggestions • {new Date(report.generatedAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}