/**
 * Calixo Platform - Workspaces: Department Icons & Starter/Workspace Templates
 *
 * Plain data only — every template just drives the same real
 * `useWorkspaces().createDepartment()` call the Departments page's own
 * "Create Department" button uses, one or more times in a row. No separate
 * creation path, no fabricated data.
 */

export const DEPARTMENT_ICONS: Record<string, string> = {
  marketing: "📈",
  admissions: "🎓",
  outreach: "📢",
  leadership: "💼",
  finance: "💰",
  sales: "🤝",
  support: "🎧",
  operations: "⚙️",
  agency: "🏢",
  product: "🧩",
  engineering: "🛠️",
  "client delivery": "📦",
};

export function iconForDepartment(name: string): string {
  return DEPARTMENT_ICONS[name.trim().toLowerCase()] ?? "🏢";
}

export interface DepartmentStarter {
  name: string;
  description: string;
  color: string;
}

/** The 8 one-click starter templates in the Departments section. */
export const DEPARTMENT_STARTERS: DepartmentStarter[] = [
  { name: "Marketing", description: "Brand, campaigns, and growth.", color: "#DB2777" },
  { name: "Sales", description: "Pipeline, deals, and revenue.", color: "#16A34A" },
  { name: "Leadership", description: "Company direction and strategy.", color: "#4F46E5" },
  { name: "Finance", description: "Budgets, billing, and forecasting.", color: "#0891B2" },
  { name: "Support", description: "Customer help and success.", color: "#D97706" },
  { name: "Operations", description: "Day-to-day execution and process.", color: "#7C3AED" },
  { name: "Admissions", description: "Student recruitment and enrollment.", color: "#16A34A" },
  { name: "Outreach", description: "Community and partner relations.", color: "#D97706" },
];

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  departments: DepartmentStarter[];
}

/** The 4 one-click workspace templates on the Workspace Overview page — each creates several department pairs at once. */
export const WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: "university",
    name: "University Template",
    description: "Admissions, Outreach, Marketing, Leadership.",
    departments: [
      { name: "Admissions", description: "Student recruitment and enrollment.", color: "#16A34A" },
      { name: "Outreach", description: "Community and partner relations.", color: "#D97706" },
      { name: "Marketing", description: "Brand, campaigns, and growth.", color: "#DB2777" },
      { name: "Leadership", description: "University direction and strategy.", color: "#4F46E5" },
    ],
  },
  {
    id: "agency",
    name: "Agency Template",
    description: "Client Delivery, Sales, Operations.",
    departments: [
      { name: "Client Delivery", description: "Client servicing and delivery.", color: "#7C3AED" },
      { name: "Sales", description: "Pipeline, deals, and revenue.", color: "#16A34A" },
      { name: "Operations", description: "Day-to-day execution and process.", color: "#0891B2" },
    ],
  },
  {
    id: "startup",
    name: "Startup Template",
    description: "Product, Engineering, Marketing, Leadership.",
    departments: [
      { name: "Product", description: "Roadmap and product decisions.", color: "#0EA5E9" },
      { name: "Engineering", description: "Building and shipping the product.", color: "#4F46E5" },
      { name: "Marketing", description: "Brand, campaigns, and growth.", color: "#DB2777" },
      { name: "Leadership", description: "Company direction and strategy.", color: "#F59E0B" },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Template",
    description: "Sales, Marketing, Operations, Finance, Leadership.",
    departments: [
      { name: "Sales", description: "Pipeline, deals, and revenue.", color: "#16A34A" },
      { name: "Marketing", description: "Brand, campaigns, and growth.", color: "#DB2777" },
      { name: "Operations", description: "Day-to-day execution and process.", color: "#0891B2" },
      { name: "Finance", description: "Budgets, billing, and forecasting.", color: "#D97706" },
      { name: "Leadership", description: "Company direction and strategy.", color: "#4F46E5" },
    ],
  },
];
