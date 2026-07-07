/**
 * Calixo Platform - Backup & Recovery Readiness (architecture only)
 *
 * No real backup/restore/PITR/DR execution exists — there is no live
 * database to back up (see Remaining Roadmap). These types give a future
 * phase a stable contract to implement against.
 */

export type BackupStatus = "pending" | "running" | "completed" | "failed";

export interface BackupJob {
  id: string;
  scope: "full" | "incremental";
  status: BackupStatus;
  startedAt?: string;
  completedAt?: string;
}

export interface RestorePoint {
  id: string;
  backupJobId: string;
  createdAt: string;
}

/** Not implemented — would coordinate with a real storage/database provider. */
export interface BackupProvider {
  createBackup(scope: BackupJob["scope"]): Promise<BackupJob>;
  restore(restorePointId: string): Promise<void>;
}
