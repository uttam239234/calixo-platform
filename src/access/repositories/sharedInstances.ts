/**
 * Calixo Platform - Shared Repository Singletons
 *
 * `RoleService`, `PolicyService`, and `AuthorizationEngine` each
 * default-construct their own repository when no instance is injected —
 * but until this file existed, each called `new InMemoryXRepository()`
 * independently, so a role assigned via `roleService.assignRoleToUser()`
 * (writing into RoleService's own instance) was invisible to
 * `authorizationEngine.authorize()` (reading from a completely separate
 * instance), and the same for policies created via `policyService`.
 * Discovered via live integration testing while building the Enterprise
 * Access Control Platform (Track 1 Phase 3). This file gives the three
 * module-level singletons one shared instance each to default to — no
 * evaluation logic changes, only the default wiring.
 */
import { InMemoryPolicyAssignmentRepository, InMemoryPolicyRepository, InMemoryUserRoleAssignmentRepository } from "./implementations";

export const sharedUserRoleAssignmentRepository = new InMemoryUserRoleAssignmentRepository();
export const sharedPolicyRepository = new InMemoryPolicyRepository();
export const sharedPolicyAssignmentRepository = new InMemoryPolicyAssignmentRepository();
