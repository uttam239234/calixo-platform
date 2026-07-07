/**
 * Calixo Platform - Illustrative Default Access Policies
 *
 * Registers a handful of real `Policy` records (via the EXISTING
 * `policyService.createPolicy()`, not a new evaluator) covering the new
 * policy categories this phase adds to `PolicyType` — subscription, time,
 * device, location — proving they genuinely evaluate through
 * `AuthorizationEngine`'s existing generic condition evaluator, since the
 * ABAC attributes (`subscriptionTier`, `resourceType`, `action`,
 * `deviceType`, `region`, `timeOfDayHour`) are what
 * `AuthorizationPlatformAPI` now injects into `request.context`.
 *
 * KNOWN LIMITATION (not fixed — `AuthorizationEngine` is not modified):
 * `evaluatePolicies()` only runs when the user has NO direct permission
 * grant for the requested action — a role that directly grants
 * `"ai:execute"` bypasses these deny policies entirely. This is an
 * existing engine characteristic, documented here rather than patched.
 * Opt-in only — not auto-invoked.
 */
import { policyPlatformAPI } from "../PolicyPlatformAPI";

let seeded = false;

export async function seedDefaultAccessPolicies(): Promise<number> {
  if (seeded) return 0;
  seeded = true;

  const actorId = "system";
  const policies = [
    policyPlatformAPI.createPolicy(
      {
        name: "Trial Tier: No AI Execution",
        description: "Denies AI skill/tool execution for organizations on the trial subscription tier.",
        type: "subscription",
        effect: "deny",
        priority: 100,
        conditions: [
          { field: "resourceType", operator: "eq", value: "ai" },
          { field: "subscriptionTier", operator: "eq", value: "trial" },
        ],
        scope: {},
      },
      actorId
    ),
    policyPlatformAPI.createPolicy(
      {
        name: "Mobile Devices: No Admin Actions",
        description: "Denies admin-level actions when the request originates from a mobile device.",
        type: "device",
        effect: "deny",
        priority: 90,
        conditions: [
          { field: "action", operator: "eq", value: "admin" },
          { field: "deviceType", operator: "eq", value: "mobile" },
        ],
        scope: {},
      },
      actorId
    ),
    policyPlatformAPI.createPolicy(
      {
        name: "After-Hours: No Approvals",
        description: "Denies approve actions after 10pm local time.",
        type: "time_based",
        effect: "deny",
        priority: 80,
        conditions: [
          { field: "action", operator: "eq", value: "approve" },
          { field: "timeOfDayHour", operator: "gte", value: 22 },
        ],
        scope: {},
      },
      actorId
    ),
    policyPlatformAPI.createPolicy(
      {
        name: "Restricted Regions",
        description: "Denies access from regions outside the organization's approved list.",
        type: "location",
        effect: "deny",
        priority: 70,
        // `exists` guards the `not_in` check — without it, a request with no
        // `region` attribute at all would match "not in the allow-list"
        // trivially and get denied by default, discovered via live smoke
        // testing (region is optional/rarely set in `AbacRequestAttributes`).
        conditions: [
          { field: "region", operator: "exists", value: null },
          { field: "region", operator: "not_in", value: ["US", "EU", "CA", "UK"] },
        ],
        scope: {},
      },
      actorId
    ),
  ];

  await Promise.all(policies);
  return policies.length;
}
