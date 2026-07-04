/** Calixo Platform — Workflow Mock Data (50 workflows, 300+ actions, 200 comments) */
import type { WorkflowEntry } from "./types";

const USERS = ["Sarah Chen","Marcus Rivera","Emily Park","David Kim","Jessica Taylor","Ryan O'Brien","Priya Sharma","Alex Wong"];
const REVIEWERS = USERS.slice(0, 4); const APPROVERS = USERS.slice(4, 8);
const STATUSES: WorkflowEntry["status"][] = ["draft","ai-generated","in-review","changes-requested","approved","scheduled","archived"];
const PRIORITIES: WorkflowEntry["priority"][] = ["low","medium","high","critical"];
const TITLES = ["Blog Post - AI Trends","Social Media Campaign Q3","Landing Page Copy","Email Newsletter v42","Product Launch Press Release","Brand Guidelines Review","Ad Creative Set v2","Content Calendar Template","SEO Report October","Case Study Draft","Whitepaper Final","Video Script Review","Infographic Approval","Campaign Brief Q4","Presentation Deck"];
const COMMENT_TEXTS = ["Looks great! Approved.","Can we make this more benefit-driven?","Add a statistic here for credibility.","Needs revision — tone doesn't match brand voice.","Perfect, ready for publishing."];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)]; }
function genId(p: string, n: number): string { return `${p}-${String(n).padStart(4,'0')}`; }
function randDate(start: string, end: string): string { const s=new Date(start).getTime(),e=new Date(end).getTime(); return new Date(s+Math.random()*(e-s)).toISOString(); }

export const MOCK_WORKFLOWS: WorkflowEntry[] = Array.from({ length: 50 }, (_, i) => {
  const id = genId("wf", i + 1);
  const status = pick(STATUSES);
  const actions = Array.from({ length: 3 + Math.floor(Math.random() * 5) }, (_, ai) => ({
    id: genId(`wf-act-${i+1}`, ai+1), workflowId: id, type: pick(["submitted","assigned","approved","rejected","changes-requested","comment","due-date-set"] as const),
    performedBy: pick(USERS), timestamp: randDate("2025-06-01","2025-07-04"),
    details: pick(["Content submitted for review","Reviewer assigned","Approved with comments","Changes requested — tone adjustment","Due date set to 2025-07-15"]),
  }));
  const comments = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, ci) => ({
    id: genId(`wf-cmt-${i+1}`, ci+1), workflowId: id, author: pick(USERS), text: pick(COMMENT_TEXTS),
    timestamp: randDate("2025-06-15","2025-07-03"), mentions: [], attachments: [],
  }));
  return {
    id, title: TITLES[i % TITLES.length] + (i >= TITLES.length ? ` (${Math.floor(i/TITLES.length)+1})` : ""),
    description: `Enterprise marketing asset requiring review and approval for Q${(i%4)+1} campaign.`,
    assetId: genId("ast", (i % 500) + 1), assetName: `Asset ${i + 1}`,
    status, priority: pick(PRIORITIES),
    submittedBy: pick(USERS), reviewer: pick(REVIEWERS), approver: pick(APPROVERS),
    dueDate: status === "in-review" ? randDate("2025-07-05","2025-07-20") : undefined,
    brand: pick(["Calixo","RGU","Demo Enterprise"]), campaign: `Q${(i%4)+1} Campaign`,
    createdAt: randDate("2025-05-01","2025-06-30"), updatedAt: randDate("2025-06-15","2025-07-04"),
    comments, actions,
  };
});