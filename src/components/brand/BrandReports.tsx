"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { ModuleReportsToolbar } from "@/components/enterprise/module";
import { brandReports } from "@/lib/brand-data";
import { FileText, Download, Clock, Eye, FileDown, BarChart3, Calendar } from "lucide-react";

const typeIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  weekly: Clock,
  monthly: Calendar,
  quarterly: Calendar,
  executive: BarChart3,
};

const formatIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  PDF: FileText,
  CSV: FileDown,
  Excel: FileDown,
};

export function BrandReports() {
  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30">
              <FileText size={20} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Brand Reports</h2>
              <p className="text-sm text-slate-400">Automated brand performance reports</p>
            </div>
          </div>
          <ModuleReportsToolbar
            onGenerateReport={() => {}}
            onExport={() => {}}
            onRefresh={() => {}}
          />
        </div>
      </motion.div>

      {/* Report Type Overview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { type: 'weekly', label: 'Weekly Reports', count: 2, color: 'emerald' },
            { type: 'monthly', label: 'Monthly Reports', count: 2, color: 'blue' },
            { type: 'quarterly', label: 'Quarterly Reports', count: 1, color: 'purple' },
            { type: 'executive', label: 'Executive Summaries', count: 1, color: 'cyan' },
          ].map((item) => (
            <Card key={item.type} padding="sm" gradient>
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-${item.color}-500/20 border border-${item.color}-500/30`}>
                  <FileText size={18} className={`text-${item.color}-400`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{item.count}</p>
                  <p className="text-xs text-slate-400">{item.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Reports List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
        <Card>
          <CardHeader title="Generated Reports" description={`${brandReports.length} reports available`} />
          <CardContent>
            <div className="space-y-3">
              {brandReports.map((report) => {
                const TypeIcon = typeIcons[report.type] || FileText;

                return (
                  <div key={report.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/40 hover:border-slate-600/60 transition-all">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/50 flex-shrink-0">
                        <TypeIcon size={18} className="text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white">{report.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{report.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              report.status === 'ready' ? 'bg-emerald-400' :
                              report.status === 'generating' ? 'bg-amber-400' : 'bg-blue-400'
                            }`} />
                            {report.status}
                          </span>
                          <span>{report.format}</span>
                          <span>{report.size}</span>
                          <span>Generated: {report.lastGenerated}</span>
                          <span>Next: {report.nextScheduled}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                        <Eye size={12} /> Preview
                      </Button>
                      <Button size="sm" className="gap-1.5 h-8 text-xs">
                        <Download size={12} /> Download
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}