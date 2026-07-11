"use client";

import { useMemo, useState } from "react";
import { Check, X, Search, Download } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useRoles } from "@/hooks/useRoles";
import { permissionName } from "@/core/platform/access";
import { ACCESS_EXPLANATION_ACTIONS, FEATURE_CHECKS, roleHasPermission, type FeatureCheck } from "@/features/settings/roles/capabilities";

export default function AccessMatrixPage() {
  const { tenantContext } = useSettingsContext();
  const roles = useRoles(tenantContext.organizationId);
  const [search, setSearch] = useState("");
  const [expandedFeature, setExpandedFeature] = useState<FeatureCheck | null>(null);

  const filteredFeatures = useMemo(() => FEATURE_CHECKS.filter(f => f.label.toLowerCase().includes(search.trim().toLowerCase())), [search]);

  const cellValue = (feature: FeatureCheck, roleId: string) => roleHasPermission(roles.permissionsByRole[roleId] ?? [], permissionName(feature.resource, feature.action));

  const handleExport = () => {
    const header = ["Feature", ...roles.roles.map(r => r.name)];
    const rows = filteredFeatures.map(feature => [feature.label, ...roles.roles.map(role => (cellValue(feature, role.id) ? "Yes" : "No"))]);
    const csv = [header, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "access-matrix.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <ModuleHeader
        title="Access Matrix"
        description="Which roles can access which features, at a glance."
        quickActions={
          <Button variant="outline" onClick={handleExport}>
            <Download size={15} />
            Export
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input inputSize="sm" placeholder="Search features…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Feature</th>
              {roles.roles.map(role => (
                <th key={role.id} className="px-4 py-3 text-center font-semibold text-foreground">
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredFeatures.map(feature => (
              <tr key={feature.id} className="border-b border-border/70 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">
                  <button type="button" onClick={() => setExpandedFeature(feature)} className="hover:text-primary hover:underline">
                    {feature.label}
                  </button>
                </td>
                {roles.roles.map(role => {
                  const allowed = cellValue(feature, role.id);
                  return (
                    <td key={role.id} className="px-4 py-3 text-center">
                      <button type="button" onClick={() => setExpandedFeature(feature)} aria-label={`${role.name} ${allowed ? "can" : "cannot"} access ${feature.label}`}>
                        {allowed ? <Check size={16} className="mx-auto text-success" /> : <X size={16} className="mx-auto text-muted-foreground" />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {expandedFeature && (
        <SimpleDialog title={expandedFeature.label} description="Exactly what each role can do with this feature." onClose={() => setExpandedFeature(null)}>
          <div className="space-y-4">
            {roles.roles.map(role => (
              <div key={role.id}>
                <p className="mb-1.5 text-sm font-semibold text-foreground">{role.name}:</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {ACCESS_EXPLANATION_ACTIONS.map(({ label, action }) => {
                    const allowed = roleHasPermission(roles.permissionsByRole[role.id] ?? [], permissionName(expandedFeature.resource, action));
                    return (
                      <span key={label} className="flex items-center gap-1.5 text-sm">
                        {allowed ? <Check size={13} className="text-success" /> : <X size={13} className="text-muted-foreground" />}
                        <span className={allowed ? "text-foreground" : "text-muted-foreground"}>{label}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SimpleDialog>
      )}
    </div>
  );
}
