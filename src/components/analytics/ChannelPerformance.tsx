"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { channelPerformance } from "./mock-data";

const statusColors: Record<string, string> = {
  Healthy: "bg-success/10 text-success border-success/20",
  Optimizing: "bg-primary/10 text-primary border-primary/20",
  Monitoring: "bg-warning/10 text-warning border-warning/20",
};

export function ChannelPerformance() {
  return (
    <Card>
      <CardHeader title="Channel Performance" description="Spend efficiency and pipeline contribution" />
      <CardContent>
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Channel</th>
                <th className="table-header-cell">Spend</th>
                <th className="table-header-cell">Revenue</th>
                <th className="table-header-cell">ROAS</th>
                <th className="table-header-cell">CPA</th>
                <th className="table-header-cell">Leads</th>
                <th className="table-header-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              {channelPerformance.map((row) => (
                <tr key={row.channel} className="table-row">
                  <td className="table-cell font-semibold text-foreground">{row.channel}</td>
                  <td className="table-cell tabular-nums">{row.spend}</td>
                  <td className="table-cell tabular-nums">{row.revenue}</td>
                  <td className="table-cell tabular-nums">{row.roas}</td>
                  <td className="table-cell tabular-nums">{row.cpa}</td>
                  <td className="table-cell tabular-nums">{row.leads}</td>
                  <td className="table-cell">
                    <span className={`badge ${statusColors[row.status] ?? "badge-secondary"}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}