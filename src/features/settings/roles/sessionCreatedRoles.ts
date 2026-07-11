/**
 * Calixo Platform - Session-Created Role Tracking
 *
 * `Role` records are a global, shared catalog (no organization field — see
 * `RolePlatformAPI`) — a brand-new custom role with zero assignments yet
 * would otherwise vanish from its own creator's organization until someone
 * is actually assigned to it. This plain module-level `Set` (not React
 * state, so every `useRoles()` instance across every page shares it — the
 * Roles page and the Templates page are separate hook instances that both
 * need to see the same "just created this session" signal) closes that gap
 * without inventing a persisted field the real `RoleService` doesn't have.
 */
export const sessionCreatedRoleIds = new Set<string>();
