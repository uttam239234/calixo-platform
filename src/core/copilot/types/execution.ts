/**
 * Calixo Platform - Copilot Execution Types
 */

export type TaskState =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "skipped";

export interface ExecutionTask {
  id: string;
  planId: string;
  stepId: string;
  toolId: string;
  label: string;
  state: TaskState;
  progress: number;
  estimatedTimeMs: number;
  actualTimeMs?: number;
  result?: unknown;
  error?: string;
  retryCount: number;
  maxRetries: number;
  startedAt?: string;
  completedAt?: string;
}

export interface ExecutionHistoryEntry {
  id: string;
  taskId: string;
  planId: string;
  state: TaskState;
  message?: string;
  timestamp: string;
}

export type ExecutionProgressListener = (task: ExecutionTask) => void;
