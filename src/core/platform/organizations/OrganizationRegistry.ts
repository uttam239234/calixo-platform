import type { Organization } from "./types";

export interface OrganizationListParams {
  status?: Organization["status"];
  tier?: Organization["tier"];
}

/** Registry of record for every Organization — same register/list/lookup/discover shape as every other platform registry (Users, Reports, Settings, Analytics dashboards). */
export class OrganizationRegistry {
  private organizations = new Map<string, Organization>();
  private slugIndex = new Map<string, string>();

  register(organization: Organization): void {
    this.organizations.set(organization.id, organization);
    this.slugIndex.set(organization.slug, organization.id);
  }

  lookup(id: string): Organization | undefined {
    return this.organizations.get(id);
  }

  lookupBySlug(slug: string): Organization | undefined {
    const id = this.slugIndex.get(slug);
    return id ? this.organizations.get(id) : undefined;
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
