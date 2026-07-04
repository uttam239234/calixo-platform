/**
 * Calixo Platform - Enterprise Module SDK
 * Bootstrap - Permanent auto-registration mechanism.
 *
 * This file is imported ONCE at application startup (from the root layout).
 * It ensures all module manifests are registered before any component renders.
 *
 * FUTURE MODULE DEVELOPERS:
 *   1. Create a Module Manifest
 *   2. Export it from manifests/index.ts
 *   3. Add it to the allManifests array in manifests/index.ts
 *   Nothing else required. Bootstrap handles the rest.
 */

import { registerAllModules } from "./manifests";

// Execute registration immediately on import.
// This runs exactly once because ES modules are cached.
registerAllModules();