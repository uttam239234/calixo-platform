/**
 * Calixo Platform - Diagnostics Platform
 *
 * Runs real checks against `HealthEngine`, `ErrorIntelligenceEngine`, and
 * `ExecutionHistoryEngine`'s dead-letter queue — no new data source, just
 * pattern-matching what's already tracked into actionable findings with
 * suggestions (mandate's "Root Cause readiness"/"Resolution Suggestions").
 */
import { generateId } from "@/shared/utils/string";
import { executionHistoryEngine } from "@/core/platform/execution/ExecutionHistoryEngine";
import { healthEngine } from "./HealthEngine";
import { errorIntelligenceEngine } from "./ErrorIntelligenceEngine";
import type { DiagnosticArea, DiagnosticFinding, DiagnosticsReport } from "./types";

function areaForComponent(componentName: string): DiagnosticArea {
  switch (componentName) {
    case "queue":
    case "workers":
    case "scheduler":
    case "execution":
      return "execution";
    case "api":
      return "api";
    case "ai":
      return "ai";
    case "cache":
    case "search":
    case "storage":
      return "storage";
    default:
      return "system";
  }
}

function areaForSource(source: string): DiagnosticArea {
  switch (source) {
    case "execution":
      return "execution";
    case "connector":
      return "connector";
    case "api":
      return "api";
    default:
      return "system";
  }
}

export class DiagnosticsEngine {
  async run(): Promise<DiagnosticsReport> {
    const now = new Date().toISOString();
    const findings: DiagnosticFinding[] = [];

    const health = await healthEngine.getSnapshot();
    for (const component of health.components) {
      if (component.state === "unhealthy") {
        findings.push({ id: generateId(10), severity: "critical", area: areaForComponent(component.name), message: `${component.name} is unhealthy${component.detail ? `: ${component.detail}` : ""}`, suggestion: "Investigate immediately via HealthPlatformAPI/OperationsPlatformAPI.", detectedAt: now });
      } else if (component.state === "degraded") {
        findings.push({ id: generateId(10), severity: "warning", area: areaForComponent(component.name), message: `${component.name} is degraded${component.detail ? `: ${component.detail}` : ""}`, detectedAt: now });
      }
    }

    const recurring = errorIntelligenceEngine.getRecurringFailures(3);
    for (const group of recurring) {
      findings.push({
        id: generateId(10),
        severity: group.count > 10 ? "critical" : "warning",
        area: areaForSource(group.source),
        message: `Recurring failure: "${group.sampleMessage}" occurred ${group.count} times since ${group.firstSeenAt}`,
        suggestion: group.suggestion,
        detectedAt: now,
      });
    }

    const deadLetter = await executionHistoryEngine.getDeadLetter();
    if (deadLetter.length > 0) {
      findings.push({
        id: generateId(10),
        severity: "warning",
        area: "execution",
        message: `${deadLetter.length} job(s) in the dead-letter queue`,
        suggestion: "Review via ExecutionHistoryPlatformAPI.getDeadLetter() and requeue once the underlying issue is fixed.",
        detectedAt: now,
      });
    }

    return { findings, generatedAt: now };
  }
}

export const diagnosticsEngine = new DiagnosticsEngine();
