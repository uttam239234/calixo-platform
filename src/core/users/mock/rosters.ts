/**
 * Calixo Platform - Hand-Shaped 4-Organization Roster
 *
 * Replaces the old 250-user/40-team randomized generator. The brief's
 * multi-org certification needs isolation to be *visibly* demonstrable —
 * a handful of named people per organization does that far better than a
 * statistically diluted pool of 250 random names. Matches the exact
 * organizations `seedOrganizationsPlatformMockData()` creates (Royal Global
 * University, Calixo Technologies, MIT WPU, Agency Client A) and the
 * brief's own worked examples (Marketing: Sarah, John, Emily; Leadership:
 * Uttam, Sarah).
 *
 * `viewerUserId` lets the org that should show `user-current` as its
 * primary demo login map onto the same id `TenantProviders.tsx` seeds
 * app-wide — the other three organizations still include a person
 * representing the viewer, but under an org-local id (a real person can
 * hold a different local directory entry per organization, the same way
 * `OrganizationMember.userId` is the cross-org identity and `core/users.User`
 * is the per-organization directory profile).
 */

import type { PeopleAccessLevel, PresenceStatus, UserStatus } from "../types/index";

export interface RosterTeamSpec {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  leadId: string;
}

export interface RosterPersonSpec {
  id: string;
  firstName: string;
  lastName: string;
  emailLocal: string;
  title: string;
  department: string;
  accessLevel: PeopleAccessLevel;
  teamIds: string[];
  status: UserStatus;
  presence: PresenceStatus;
  isViewer?: boolean;
}

export interface OrgRosterSpec {
  organizationName: string;
  viewerUserId: string;
  teams: RosterTeamSpec[];
  people: RosterPersonSpec[];
}

export const ORG_ROSTERS: OrgRosterSpec[] = [
  {
    organizationName: "Calixo Technologies",
    viewerUserId: "user-current",
    teams: [
      { id: "team-calixo-leadership", name: "Leadership", description: "Company direction and strategy.", color: "#4F46E5", icon: "compass", leadId: "user-current" },
      { id: "team-calixo-marketing", name: "Marketing", description: "Brand, campaigns, and growth.", color: "#DB2777", icon: "megaphone", leadId: "user-calixo-sarah" },
      { id: "team-calixo-finance", name: "Finance", description: "Budgets, billing, and forecasting.", color: "#0891B2", icon: "database", leadId: "user-calixo-priya" },
    ],
    people: [
      { id: "user-current", firstName: "Uttam", lastName: "Das", emailLocal: "uttam", title: "Founder & CEO", department: "Executive", accessLevel: "owner", teamIds: ["team-calixo-leadership"], status: "active", presence: "online", isViewer: true },
      { id: "user-calixo-sarah", firstName: "Sarah", lastName: "Chen", emailLocal: "sarah.chen", title: "Marketing Manager", department: "Marketing", accessLevel: "administrator", teamIds: ["team-calixo-marketing", "team-calixo-leadership"], status: "active", presence: "online" },
      { id: "user-calixo-john", firstName: "John", lastName: "Rodriguez", emailLocal: "john.rodriguez", title: "Content Marketer", department: "Marketing", accessLevel: "manager", teamIds: ["team-calixo-marketing"], status: "active", presence: "away" },
      { id: "user-calixo-emily", firstName: "Emily", lastName: "Watson", emailLocal: "emily.watson", title: "Growth Associate", department: "Marketing", accessLevel: "member", teamIds: ["team-calixo-marketing"], status: "active", presence: "offline" },
      { id: "user-calixo-priya", firstName: "Priya", lastName: "Patel", emailLocal: "priya.patel", title: "Finance Lead", department: "Finance", accessLevel: "administrator", teamIds: ["team-calixo-finance"], status: "active", presence: "online" },
      { id: "user-calixo-noah", firstName: "Noah", lastName: "Kim", emailLocal: "noah.kim", title: "Support Specialist", department: "Customer Success", accessLevel: "viewer", teamIds: [], status: "invited", presence: "offline" },
    ],
  },
  {
    organizationName: "Royal Global University",
    viewerUserId: "user-royalglobal-owner",
    teams: [
      { id: "team-royalglobal-leadership", name: "Leadership", description: "University direction and strategy.", color: "#4F46E5", icon: "compass", leadId: "user-royalglobal-owner" },
      { id: "team-royalglobal-admissions", name: "Admissions", description: "Student recruitment and enrollment.", color: "#16A34A", icon: "target", leadId: "user-royalglobal-meera" },
      { id: "team-royalglobal-outreach", name: "Outreach", description: "Community and alumni relations.", color: "#D97706", icon: "briefcase", leadId: "user-royalglobal-raj" },
    ],
    people: [
      { id: "user-royalglobal-owner", firstName: "Uttam", lastName: "Das", emailLocal: "uttam", title: "Founder & CEO", department: "Executive", accessLevel: "owner", teamIds: ["team-royalglobal-leadership"], status: "active", presence: "online", isViewer: true },
      { id: "user-royalglobal-meera", firstName: "Meera", lastName: "Iyer", emailLocal: "meera.iyer", title: "Admissions Director", department: "Admissions", accessLevel: "administrator", teamIds: ["team-royalglobal-admissions"], status: "active", presence: "online" },
      { id: "user-royalglobal-raj", firstName: "Raj", lastName: "Kapoor", emailLocal: "raj.kapoor", title: "Outreach Manager", department: "Outreach", accessLevel: "manager", teamIds: ["team-royalglobal-outreach"], status: "active", presence: "away" },
      { id: "user-royalglobal-ananya", firstName: "Ananya", lastName: "Roy", emailLocal: "ananya.roy", title: "Admissions Counselor", department: "Admissions", accessLevel: "member", teamIds: ["team-royalglobal-admissions"], status: "active", presence: "offline" },
      { id: "user-royalglobal-devika", firstName: "Devika", lastName: "Nair", emailLocal: "devika.nair", title: "Alumni Coordinator", department: "Outreach", accessLevel: "member", teamIds: ["team-royalglobal-outreach"], status: "suspended", presence: "offline" },
    ],
  },
  {
    organizationName: "MIT WPU",
    viewerUserId: "user-mitwpu-consultant",
    teams: [
      { id: "team-mitwpu-admissions", name: "Admissions", description: "Student recruitment and enrollment.", color: "#16A34A", icon: "target", leadId: "user-mitwpu-arjun" },
      { id: "team-mitwpu-outreach", name: "Outreach", description: "Community and industry partnerships.", color: "#D97706", icon: "briefcase", leadId: "user-mitwpu-kavya" },
    ],
    people: [
      { id: "user-mitwpu-consultant", firstName: "Uttam", lastName: "Das", emailLocal: "uttam", title: "Growth Consultant", department: "Executive", accessLevel: "administrator", teamIds: [], status: "active", presence: "online", isViewer: true },
      { id: "user-mitwpu-arjun", firstName: "Arjun", lastName: "Mehta", emailLocal: "arjun.mehta", title: "Admissions Manager", department: "Admissions", accessLevel: "manager", teamIds: ["team-mitwpu-admissions"], status: "active", presence: "online" },
      { id: "user-mitwpu-kavya", firstName: "Kavya", lastName: "Reddy", emailLocal: "kavya.reddy", title: "Outreach Manager", department: "Outreach", accessLevel: "manager", teamIds: ["team-mitwpu-outreach"], status: "active", presence: "away" },
      { id: "user-mitwpu-neha", firstName: "Neha", lastName: "Joshi", emailLocal: "neha.joshi", title: "Admissions Counselor", department: "Admissions", accessLevel: "member", teamIds: ["team-mitwpu-admissions"], status: "active", presence: "offline" },
    ],
  },
  {
    organizationName: "Agency Client A",
    viewerUserId: "user-agencyclienta-viewer",
    teams: [{ id: "team-agencyclienta-agency", name: "Agency", description: "Client servicing and delivery.", color: "#7C3AED", icon: "layers", leadId: "user-agencyclienta-carlos" }],
    people: [
      { id: "user-agencyclienta-carlos", firstName: "Carlos", lastName: "Mendez", emailLocal: "carlos.mendez", title: "Agency Owner", department: "Executive", accessLevel: "owner", teamIds: ["team-agencyclienta-agency"], status: "active", presence: "online" },
      { id: "user-agencyclienta-grace", firstName: "Grace", lastName: "Kim", emailLocal: "grace.kim", title: "Account Manager", department: "Agency", accessLevel: "manager", teamIds: ["team-agencyclienta-agency"], status: "active", presence: "online" },
      { id: "user-agencyclienta-viewer", firstName: "Uttam", lastName: "Das", emailLocal: "uttam", title: "Client Stakeholder", department: "Executive", accessLevel: "viewer", teamIds: [], status: "active", presence: "offline", isViewer: true },
    ],
  },
];
