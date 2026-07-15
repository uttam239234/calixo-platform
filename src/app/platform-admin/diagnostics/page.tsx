/**
 * Calixo Platform - Access Diagnostics
 *
 * Built to investigate a real reported bug: an authenticated Platform
 * Owner/Admin couldn't access Settings/Users & Teams/Billing/Integrations
 * despite being the intended owner. Root causes found and fixed (see
 * `identity/bridge/resolveCalixoIdentity.ts` and
 * `core/platform/access/AuthorizationPlatformAPI.ts`) — this page is the
 * permanent diagnostic surface that made the investigation possible and
 * stays useful for the next report like it.
 *
 * A real Server Component — every value below is read from the actual
 * signed-in session and the actual, already-real authorization engine, not
 * mocked for this page.
 */
import { auth, currentUser } from "@clerk/nextjs/server";
import { resolveIdentity } from "@/identity/bridge/resolveIdentity.server";
import { userRegistry } from "@/core/users";
import { organizationPlatformAPI } from "@/core/platform/organizations";
import { authorizationPlatformAPI, hasPlatformBypass } from "@/core/platform/access";
import { resolvePlatformRoleServer } from "@/features/platform-admin/resolvePlatformRole.server";
import { INTERNAL_ROLE_LABELS } from "@/identity/platformRole";

const REQUIRED_PERMISSIONS: Record<string, { label: string; permissions: string[] }> = {
  settings: { label: "Settings", permissions: ["settings:read", "settings:update", "settings:admin"] },
  users: { label: "Users & Teams", permissions: ["user:read", "user:update", "user:manage"] },
  billing: { label: "Billing", permissions: ["billing:read", "billing:update", "billing:manage"] },
  integrations: { label: "Integrations", permissions: ["connector:read", "connector:update", "connector:manage"] },
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  );
}

export default async function DiagnosticsPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return <p className="text-sm text-muted-foreground">Not signed in.</p>;
  }

  const [clerkUser, identity, platformRoleResult] = await Promise.all([currentUser(), resolveIdentity(), resolvePlatformRoleServer()]);
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? "(no email on Clerk account)";

  if (!identity) {
    return <p className="text-sm text-destructive">Could not resolve a Calixo identity for this session.</p>;
  }

  const calixoUser = userRegistry.lookup(identity.userId);
  const members = organizationPlatformAPI.getMembers(identity.organizationId);
  const organizationRole = members.find(m => m.userId === identity.userId)?.role ?? "(no membership record)";

  const permissions = await authorizationPlatformAPI.getEffectivePermissions(identity.userId, identity.organizationId);
  const bypassActive = hasPlatformBypass(identity.userId);

  const moduleChecks = Object.entries(REQUIRED_PERMISSIONS).map(([key, { label, permissions: required }]) => {
    const missing = required.filter(p => !permissions.includes(p));
    return { key, label, required, missing, hasAccess: missing.length === 0 };
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Identity Snapshot</h2>
        <div className="mt-3 rounded-2xl border border-border bg-card p-5">
          <Row label="email" value={email} />
          <Row label="userId" value={identity.userId} />
          <Row label="organizationId" value={identity.organizationId} />
          <Row label="organizationRole" value={String(organizationRole)} />
          <Row label="platformRole" value={`${platformRoleResult.role} (${INTERNAL_ROLE_LABELS[platformRoleResult.role]})`} />
          <Row label="platformBypassActive" value={String(bypassActive)} />
          <Row label="permissions" value={permissions.length > 20 ? `${permissions.length} permissions (bypass — full access)` : permissions.join(", ") || "(none)"} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground">Module Access</h2>
        <div className="mt-3 space-y-3">
          {moduleChecks.map(check => (
            <div key={check.key} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">{check.label}</p>
                <span className={`badge ${check.hasAccess ? "badge-success" : "badge-destructive"}`}>{check.hasAccess ? "Full access" : "Missing permissions"}</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">Required: {check.required.join(", ")}</p>
              {check.missing.length > 0 && <p className="mt-1 text-xs text-destructive">Missing: {check.missing.join(", ")}</p>}
            </div>
          ))}
        </div>
      </div>

      {calixoUser?.metadata?.platformRole !== undefined && (
        <p className="text-xs text-muted-foreground">
          Resolved via <code className="rounded bg-surface px-1">User.metadata.platformRole</code> = <code className="rounded bg-surface px-1">{String(calixoUser?.metadata?.platformRole)}</code>, stamped
          fresh on every request by <code className="rounded bg-surface px-1">resolveCalixoIdentity()</code>.
        </p>
      )}
    </div>
  );
}
