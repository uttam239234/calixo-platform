/**
 * Calixo Platform - Platform Configuration Store: Mutation Helper
 *
 * The one seam every Plan Management Console save action routes through:
 * assert Platform Admin access, run the REAL server-side engine mutation
 * (never a client-supplied blob applied blindly), persist the resulting
 * table to disk, and audit it — mirroring the Secrets console's Server
 * Action pattern (`app/platform-admin/secrets/actions.ts`) for the other 7
 * sections. `import "server-only"` — only ever imported from `"use server"`
 * action files.
 */
import "server-only";
import { assertPlatformAdmin } from "@/app/platform-admin/guard";
import { auditService } from "@/access/audit/AuditService";
import { PLATFORM_ADMIN_ORG_SENTINEL } from "@/features/platform-admin/commitPlanChange";
import { writeTable } from "./PlatformConfigFileStore";
import type { PlatformConfigTable } from "./types";

export interface PlatformConfigMutationParams<T> {
  table: PlatformConfigTable;
  entityType: string;
  entityId: string;
  description: string;
  /** Performs the real, server-side engine mutation and returns the table's full current rows — what gets written to disk. */
  mutate: () => T;
}

export type PlatformConfigMutationResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function runPlatformConfigMutation<T>(params: PlatformConfigMutationParams<T>): Promise<PlatformConfigMutationResult<T>> {
  try {
    const { userId } = await assertPlatformAdmin();
    const data = params.mutate();
    await writeTable(params.table, data);
    await auditService.recordEvent({
      organizationId: PLATFORM_ADMIN_ORG_SENTINEL,
      userId,
      eventType: "entity_updated",
      resource: params.entityType,
      resourceId: params.entityId,
      description: params.description,
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}
