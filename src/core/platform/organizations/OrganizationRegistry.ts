import type { Organization } from "./types";

export interface OrganizationListParams {
  status?: Organization["status"];
  tier?: Organization["tier"];
}

/** Registry of record for every Organization — same register/list/lookup/discover shape as every other platform registry (Users, Reports, Settings, Analytics dashboards). */
export class OrganizationRegistry {
  private organizations = new Map<string, Organization>();
  private slugIndex = new Map<string, string>();
  private clerkOrgIndex = new Map<string, string>();

  register(organization: Organization): void {
    this.organizations.set(organization.id, organization);
    this.slugIndex.set(organization.slug, organization.id);
    if (organization.clerkOrgId) this.clerkOrgIndex.set(organization.clerkOrgId, organization.id);
  }

  lookup(id: string): Organization | undefined {
    return this.organizations.get(id);
  }

  lookupBySlug(slug: string): Organization | undefined {
    const id = this.slugIndex.get(slug);
    return id ? this.organizations.get(id) : undefined;
  }

  /** Reverse lookup for the real Clerk migration (Round 18) — resolves a Calixo Organization from a verified Clerk session's `orgId`. */
  lookupByClerkOrgId(clerkOrgId: string): Organization | undefined {
    const id = this.clerkOrgIndex.get(clerkOrgId);
    return id ? this.organizations.get(id) : undefined;
  }

  /** Stamps a Clerk org id onto an already-registered organization (e.g. a pre-seeded demo org matched by name on first real sign-in) and keeps the reverse index in sync. */
  linkClerkOrg(organizationId: string, clerkOrgId: string): void {
    const organization = this.organizations.get(organizationId);
    if (!organization) return;
    organization.clerkOrgId = clerkOrgId;
    this.clerkOrgIndex.set(clerkOrgId, organizationId);
  }

  list(params: OrganizationListParams = {}): Organization[] {
    return Array.from(this.organizations.values()).filter(o => {
      if (params.status && o.status !== params.status) return false;
      if (params.tier && o.tier !== params.tier) return false;
      return true;
    });
  }

  discover(query: string): Organization[] {
    const q = query.toLowerCase();
    return this.list().filter(o => o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q));
  }

  remove(id: string): boolean {
    const org = this.organizations.get(id);
    if (org) this.slugIndex.delete(org.slug);
    return this.organizations.delete(id);
  }

  count(): number {
    return this.organizations.size;
  }
}

export const organizationRegistry = new OrganizationRegistry();
