"use client";

import { ContentHeader } from "@/components/content/ContentSharedComponents";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { contentTemplates } from "@/lib/content-data";

export default function TemplatesPage() {
  return (
    <div className="space-y-6 pb-8">
      <ContentHeader title="Templates" description="Pre-built content templates with AI suggestions">
        <Button size="sm" className="gap-2"><Plus size={14} /> New Template</Button>
      </ContentHeader>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contentTemplates.slice(0, 9).map((tpl) => (
          <motion.div key={tpl.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader title={tpl.name} description={tpl.description.slice(0, 60) + "..."} />
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full">{tpl.category}</span>
                  <span>{tpl.usageCount} uses</span>
                  {tpl.isAIGenerated && <span className="text-purple-400">AI</span>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}