"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useAudit } from "@/features/settings/audit/useAudit";
import { formatDate } from "@/shared/utils/date";
import type { RestorePoint } from "@/features/settings/audit/restoreSetters";

export default function AuditRestorePage() {
  const { tenantContext, showToast } = useSettingsContext();
  const audit = useAudit(tenantContext.organizationId);
  const [confirming, setConfirming] = useState<RestorePoint | null>(null);

  return (
    <div className="space-y-6">
      <ModuleHeader title="Restore Points" description="Recoverable changes — undo them in one confirmation." />

      {!audit.isInternalStaff && (
        <p className="text-sm text-muted-foreground">No recoverable changes for your organization yet.</p>
      )}

      {audit.isInternalStaff && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Internal Only — Calixo Staff</p>
          {audit.restorePoints.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recoverable changes yet.</p>
          ) : (
            <div className="space-y-2">
              {audit.restorePoints.map(point => (
                <div key={`${point.entityType}:${point.entityId}`} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
                  <div>
                    <p className="font-medium text-foreground">{point.label}</p>
                    <p className="text-xs text-muted-foreground">Last changed {formatDate(point.updatedAt)}</p>
                  </div>
                  <Button variant="outline" size="sm" disabled={!point.canRestore} onClick={() => setConfirming(point)}>
                    <RotateCcw size={13} />
                    Restore Previous Version
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {confirming && (
        <SimpleDialog
          title={`Restore ${confirming.label}?`}
          description="This reverts to the previous version. You can restore again to change it back."
          onClose={() => setConfirming(null)}
        >
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirming(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const ok = audit.restore(confirming);
                showToast(ok ? "Restored to the previous version." : "Couldn't restore this change.");
                setConfirming(null);
              }}
            >
              Restore
            </Button>
          </div>
        </SimpleDialog>
      )}
    </div>
  );
}
