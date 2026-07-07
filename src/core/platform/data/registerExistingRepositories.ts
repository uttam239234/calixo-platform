/**
 * Calixo Platform - Existing Repository Registration
 *
 * The one file allowed to import concrete pre-existing module repositories
 * (mirroring `registerAllPlatformRegistries.ts`'s "one file, sideways
 * imports" convention) purely to index them into `RepositoryRegistry` —
 * zero behavior change to the modules themselves.
 *
 * Scope note (Data Architecture Audit finding): most module services
 * (`knowledgeService`, `notificationService`, `teamService`,
 * `departmentService`, ...) deliberately expose only tenant-scoped queries,
 * not a global `getAll()` — correct tenant-isolation hygiene, not an
 * oversight. Only services with a genuine unscoped catalog (`promptService`,
 * `agentService` — org-agnostic templates — and access's system-wide
 * `roleService`/`policyService`) are registered here as a representative,
 * honest sample. Registering every module's repository would require
 * per-organization aggregation, which is out of scope for this phase (see
 * the Remaining Roadmap in the final report).
 */
import { roleService } from "@/access/services/RoleService";
import { policyService } from "@/access/services/PolicyService";
import { promptService } from "@/aios/services/PromptService";
import { agentService } from "@/aios/services/AgentService";
import { repositoryRegistry } from "./RepositoryRegistry";

let registered = false;

/**
 * `RepositoryRegistration.count()` is synchronous (matching `PlatformRegistry`'s
 * `RegisteredRegistry` convention), but every registered existing-module
 * service method is async — this cache is what makes `count()` synchronous
 * without lying: it's seeded immediately below and kept fresh by
 * `refreshExistingRepositoryCounts()`, rather than hardcoding a fake `0`.
 */
const latestCounts: Record<string, number> = { role: 0, policy: 0, prompt: 0, agent: 0 };

export async function refreshExistingRepositoryCounts(): Promise<Record<string, number>> {
  const [roles, policies, prompts, agents] = await Promise.all([
    roleService.getAllRoles(),
    policyService.getAllPolicies(),
    promptService.getAllPrompts(),
    agentService.getAllAgents(),
  ]);
  latestCounts.role = roles.length;
  latestCounts.policy = policies.length;
  latestCounts.prompt = prompts.length;
  latestCounts.agent = agents.length;
  return { ...latestCounts };
}

export async function registerExistingRepositories(): Promise<void> {
  if (registered) return;
  registered = true;

  await refreshExistingRepositoryCounts();

  repositoryRegistry.register({
    entityType: "role",
    module: "access",
    kind: "RoleService (InMemoryRoleRepository)",
    origin: "existing_module",
    count: () => latestCounts.role,
  });
  repositoryRegistry.register({
    entityType: "policy",
    module: "access",
    kind: "PolicyService (InMemoryPolicyRepository)",
    origin: "existing_module",
    count: () => latestCounts.policy,
  });
  repositoryRegistry.register({
    entityType: "prompt",
    module: "aios",
    kind: "PromptService (InMemoryPromptRepository)",
    origin: "existing_module",
    count: () => latestCounts.prompt,
  });
  repositoryRegistry.register({
    entityType: "agent",
    module: "aios",
    kind: "AgentService (InMemoryAgentRepository)",
    origin: "existing_module",
    count: () => latestCounts.agent,
  });
}
