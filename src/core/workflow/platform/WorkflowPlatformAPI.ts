/**
 * Calixo Platform - Workflow Platform API
 *
 * The sanctioned way another module reads Workflow data — wraps
 * `WorkflowEngine` so Dashboard no longer needs to import it directly
 * (flagged as direct engine coupling by the Enterprise Architecture
 * Audit). Mirrors Analytics' `AnalyticsPlatformAPI` pattern exactly.
 */
import { WorkflowEngine } from "../WorkflowEngine";
import type { WorkflowSummary } from "@/core/platform/contracts";
import type { WorkflowEntry } from "../types";

export class WorkflowPlatformAPI {
  getWorkflowSummary(): WorkflowSummary {
    const kpis = WorkflowEngine.getKPIs();
    return { pending: kpis.pending, overdue: kpis.overdue, approved: kpis.approved, avgApprovalDays: kpis.avgApprovalDays };
  }

  getPendingApprovals(limit = 5): WorkflowEntry[] {
    return [...WorkflowEngine.getByStatus("in-review"), ...WorkflowEngine.getByStatus("changes-requested")].slice(0, limit);
  }

  getActivity(limit = 8): (WorkflowEntry["actions"][number] & { workflowTitle: string })[] {
    return WorkflowEngine.getActivity().slice(0, limit);
  }

  getOverdue(): WorkflowEntry[] {
    return WorkflowEngine.getOverdue();
  }

  getUpcoming(limit = 6): WorkflowEntry[] {
    return WorkflowEngine.getAll()
      .filter(w => w.dueDate && !["approved", "published", "archived"].includes(w.status))
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, limit);
  }

}

export const workflowPlatformAPI = new WorkflowPlatformAPI();
