/** Calixo Platform — Workflow Engine (Central orchestrator) */
import type { WorkflowEntry, WorkflowStatus, WorkflowAction, WorkflowComment } from "./types";
import { MOCK_WORKFLOWS } from "./mock-data";

const workflows = [...MOCK_WORKFLOWS];

export const WorkflowEngine = {
  getAll(): WorkflowEntry[] { return [...workflows]; },
  get(id: string): WorkflowEntry | undefined { return workflows.find(w => w.id === id); },
  getByStatus(status: WorkflowStatus): WorkflowEntry[] { return workflows.filter(w => w.status === status); },
  getByReviewer(user: string): WorkflowEntry[] { return workflows.filter(w => w.reviewer === user || w.approver === user); },
  getByBrand(brand: string): WorkflowEntry[] { return workflows.filter(w => w.brand === brand); },
  getOverdue(): WorkflowEntry[] { const now = new Date(); return workflows.filter(w => w.dueDate && new Date(w.dueDate) < now && (w.status === "in-review" || w.status === "changes-requested")); },
  getKPIs() {
    const total = workflows.length;
    const pending = this.getByStatus("in-review").length + this.getByStatus("changes-requested").length;
    const approved = this.getByStatus("approved").length;
    const rejected = workflows.reduce((c, w) => c + w.actions.filter(a => a.type === "rejected").length, 0);
    const overdue = this.getOverdue().length;
    const avgApprovalDays = 2.5;
    return { total, pending, approved, rejected, overdue, avgApprovalDays };
  },
  getActivity(): (WorkflowAction & { workflowTitle: string })[] {
    return workflows.flatMap(w => w.actions.slice(-3).map(a => ({ ...a, workflowTitle: w.title, workflowId: w.id })))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 30);
  },
  approve(id: string, userId: string): WorkflowEntry | undefined {
    const w = workflows.find(w => w.id === id); if (!w) return undefined;
    w.status = "approved"; w.updatedAt = new Date().toISOString();
    w.actions.push({ id: `act-${Date.now()}`, workflowId: id, type: "approved", performedBy: userId, timestamp: new Date().toISOString(), details: "Approved", previousStatus: "in-review", newStatus: "approved" });
    return { ...w };
  },
  reject(id: string, userId: string, reason: string): WorkflowEntry | undefined {
    const w = workflows.find(w => w.id === id); if (!w) return undefined;
    w.status = "changes-requested"; w.updatedAt = new Date().toISOString();
    w.actions.push({ id: `act-${Date.now()}`, workflowId: id, type: "rejected", performedBy: userId, timestamp: new Date().toISOString(), details: reason, previousStatus: "in-review", newStatus: "changes-requested" });
    return { ...w };
  },
  addComment(workflowId: string, author: string, text: string): WorkflowComment | undefined {
    const w = workflows.find(w => w.id === workflowId); if (!w) return undefined;
    const comment: WorkflowComment = { id: `cmt-${Date.now()}`, workflowId, author, text, timestamp: new Date().toISOString(), mentions: [], attachments: [] };
    w.comments.push(comment);
    w.actions.push({ id: `act-${Date.now()}`, workflowId, type: "comment", performedBy: author, timestamp: new Date().toISOString(), details: `Added comment` });
    return comment;
  },
};