/**
 * Calixo Platform - Connector Wizard Engine
 *
 * Every connector — simple or enterprise — drives the SAME 10-step flow
 * (Welcome -> Authentication -> Choose Account -> Choose Workspace ->
 * Choose Brand -> Choose Data -> Choose Sync -> Review -> Connect ->
 * Success). This is the real, drivable state machine a UI wizard would
 * bind to (`start`/`next`/`back`/`getState`) — this phase builds the
 * backend state machine, consistent with every other phase in this
 * program (Access, Data, Identity) shipping platform logic without
 * hand-authored React screens; no wizard UI component is built here.
 */
import { generateId } from "@/shared/utils/string";
import { connectorManifestRegistry } from "./ConnectorManifestRegistry";
import { integrationService } from "@/integrations/services/IntegrationService";
import type { Connection } from "@/integrations/types";
import { WIZARD_STEPS, type WizardState, type WizardStepId } from "./types";

export class ConnectorWizardEngine {
  private wizards = new Map<string, WizardState>();

  start(providerId: string, organizationId: string): WizardState {
    if (!connectorManifestRegistry.has(providerId)) {
      throw new Error(`Unknown connector: ${providerId}. The Marketplace only lists registered manifests.`);
    }

    const now = new Date().toISOString();
    const state: WizardState = {
      wizardId: generateId(16),
      providerId,
      organizationId,
      currentStepIndex: 0,
      currentStep: WIZARD_STEPS[0],
      completedSteps: [],
      selections: {},
      startedAt: now,
      updatedAt: now,
    };
    this.wizards.set(state.wizardId, state);
    return { ...state };
  }

  getState(wizardId: string): WizardState {
    const state = this.wizards.get(wizardId);
    if (!state) throw new Error(`Unknown wizard session: ${wizardId}`);
    return { ...state };
  }

  /** Records the current step's user input and advances to the next step. `Connect` (step 9) actually creates the connection via the reused `IntegrationService`. */
  async next(wizardId: string, input: Partial<WizardState["selections"]> = {}): Promise<WizardState> {
    const state = this.wizards.get(wizardId);
    if (!state) throw new Error(`Unknown wizard session: ${wizardId}`);

    Object.assign(state.selections, input);
    state.completedSteps.push(state.currentStep);

    if (state.currentStep === "connect") {
      const connection: Connection = await integrationService.createConnection(state.organizationId, state.providerId, {
        workspaceId: state.selections.workspaceId,
        brandId: state.selections.brandId,
        dataTypes: state.selections.dataTypes,
        syncFrequency: state.selections.syncFrequency,
      });
      await integrationService.connect(connection.id);
      state.connectionId = connection.id;
    }

    if (state.currentStepIndex >= WIZARD_STEPS.length - 1) {
      state.finishedAt = new Date().toISOString();
    } else {
      state.currentStepIndex++;
      state.currentStep = WIZARD_STEPS[state.currentStepIndex];
    }
    state.updatedAt = new Date().toISOString();

    this.wizards.set(wizardId, state);
    return { ...state };
  }

  back(wizardId: string): WizardState {
    const state = this.wizards.get(wizardId);
    if (!state) throw new Error(`Unknown wizard session: ${wizardId}`);
    if (state.currentStepIndex > 0) {
      state.currentStepIndex--;
      state.currentStep = WIZARD_STEPS[state.currentStepIndex];
      state.completedSteps = state.completedSteps.filter(s => s !== state.currentStep);
      state.updatedAt = new Date().toISOString();
    }
    return { ...state };
  }

  isComplete(wizardId: string): boolean {
    return Boolean(this.wizards.get(wizardId)?.finishedAt);
  }

  stepFor(index: number): WizardStepId {
    return WIZARD_STEPS[index];
  }

  count(): number {
    return this.wizards.size;
  }
}

export const connectorWizardEngine = new ConnectorWizardEngine();
