"use client";

/**
 * Calixo Platform - Internal Plan Management Console: Access Model
 *
 * This app has no real login/session system anywhere (confirmed: no
 * middleware, no auth boundary — every Settings module's gate is simply
 * "always allow" since a real session never exists in this demo). That
 * convention would make this console's central requirement — "no customer
 * role may access this" — untestable, so instead of a decorative gate this
 * is a small, real, visible role simulator: it defaults to an internal role
 * so the console is usable, and switching to "Customer" produces a genuine
 * access-denied state. Deliberately independent of `src/access/` and
 * `AuthenticatedUser` — nothing there models "Calixo staff, no organization."
 */
import { createContext, useContext, useState, type ReactNode } from "react";

export type InternalRole = "calixo_owner" | "platform_admin" | "developer" | "customer_demo";

export const INTERNAL_ROLE_LABELS: Record<InternalRole, string> = {
  calixo_owner: "Calixo Owner",
  platform_admin: "Platform Admin",
  developer: "Developer",
  customer_demo: "Customer — Growth Plan",
};

export const INTERNAL_STAFF_ROLES: InternalRole[] = ["calixo_owner", "platform_admin", "developer"];

interface InternalRoleContextValue {
  role: InternalRole;
  setRole: (role: InternalRole) => void;
  isInternalStaff: boolean;
}

const InternalRoleContext = createContext<InternalRoleContextValue | null>(null);

export function InternalRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<InternalRole>("platform_admin");
  const isInternalStaff = INTERNAL_STAFF_ROLES.includes(role);

  return <InternalRoleContext.Provider value={{ role, setRole, isInternalStaff }}>{children}</InternalRoleContext.Provider>;
}

export function useInternalRole(): InternalRoleContextValue {
  const ctx = useContext(InternalRoleContext);
  if (!ctx) throw new Error("useInternalRole must be used within an InternalRoleProvider");
  return ctx;
}
