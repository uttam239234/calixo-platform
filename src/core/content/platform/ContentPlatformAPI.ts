/**
 * Calixo Platform - Content Platform API
 *
 * The single sanctioned entry point for Content Studio's UI — everything else (the provider,
 * components) calls this facade, never `ContentOrchestrationEngine` or any underlying generation
 * engine directly. Wraps the orchestration engine plus real calls into Assets/Workflow/Brand —
 * Content Studio owns none of those platforms itself.
 */
import { assetsPlatformAPI } from "@/core/assets";
import { workflowPlatformAPI, type WorkflowPriority } from "@/core/workflow";
import { brandPlatformAPI, type BrandStyleProfile } from "@/core/brand";
import { contentOrchestrationEngine } from "../engine/ContentOrchestrationEngine";
import { OutputCatalogRegistry } from "../registry/OutputCatalogRegistry";
import type {
  ContentAction,
  ContentBrief,
  ContentOutputCatalogEntry,
  ContentOutputKind,
  CreativeOutputCatalogEntry,
  CreativeOutputKind,
  GenerationHistoryEntry,
} from "../types";

export class ContentPlatformAPI {
  listCreativeCatalog(): CreativeOutputCatalogEntry[] {
    return OutputCatalogRegistry.listCreative();
  }

  listContentCatalog(): ContentOutputCatalogEntry[] {
    return OutputCatalogRegistry.listContent();
  }

  generateCreative(brief: ContentBrief, outputId: CreativeOutputKind, organizationId: string): Promise<GenerationHistoryEntry> {
    return contentOrchestrationEngine.generateCreative(brief, outputId, organizationId);
  }

  generateContent(brief: ContentBrief, outputId: ContentOutputKind, organizationId: string): Promise<GenerationHistoryEntry> {
    return contentOrchestrationEngine.generateContent(brief, outputId, organizationId);
  }

  applyContentAction(entryId: string, action: ContentAction): Promise<GenerationHistoryEntry> {
    return contentOrchestrationEngine.applyContentAction(entryId, action);
  }

  localizeEntry(entryId: string, language: string): GenerationHistoryEntry {
    return contentOrchestrationEngine.localizeEntry(entryId, language);
  }

  /** Only takes effect once, before any real generation happens — seeds "My Creations" so it isn't empty on first load. */
  seedHistory(entries: GenerationHistoryEntry[]): void {
    contentOrchestrationEngine.seedHistory(entries);
  }

  listHistory(organizationId: string): GenerationHistoryEntry[] {
    return contentOrchestrationEngine.listHistory(organizationId);
  }

  getHistoryEntry(id: string): GenerationHistoryEntry | undefined {
    return contentOrchestrationEngine.getHistoryEntry(id);
  }

  /** The fix for every dead "Save as Asset" button — real create path via the Asset Platform. */
  saveToAssets(entryId: string, workspace: string, createdBy: string): string | undefined {
    const entry = contentOrchestrationEngine.getHistoryEntry(entryId);
    if (!entry) return undefined;
    const asset = assetsPlatformAPI.saveGeneratedAsset({
      name: `${entry.outputLabel} — ${entry.brief.objective}`.slice(0, 120),
      type: entry.kind === "creative" ? "creative-doc" : "content-doc",
      workspace,
      createdBy,
      fileUrl: entry.primaryImageUrl,
      preview: entry.primaryImageUrl,
      tags: entry.hashtags ?? [],
    });
    contentOrchestrationEngine.markSaved(entryId, asset.id);
    return asset.id;
  }

  /** Content Studio owns no workflow engine — this only submits to the real one. */
  submitForApproval(entryId: string, submittedBy: string, priority: WorkflowPriority = "medium"): string | undefined {
    const entry = contentOrchestrationEngine.getHistoryEntry(entryId);
    if (!entry) return undefined;
    const workflowEntry = workflowPlatformAPI.createWorkflow({
      title: `Approve: ${entry.outputLabel}`,
      description: entry.primaryText ?? entry.brief.objective,
      assetId: entry.id,
      assetName: entry.outputLabel,
      priority,
      submittedBy,
    });
    contentOrchestrationEngine.markSubmitted(entryId, workflowEntry.id);
    return workflowEntry.id;
  }

  getBrandStyleDefaults(brandId: string): BrandStyleProfile | undefined {
    return brandPlatformAPI.getBrandStyleProfile(brandId);
  }
}

export const contentPlatformAPI = new ContentPlatformAPI();
