/**
 * Calixo Platform - SDK Platform API
 */
import { sdkGenerator } from "./SdkGenerator";
import type { ApiVersion, SdkGenerationResult, SdkLanguage } from "./types";

export class SDKPlatformAPI {
  generate(language: SdkLanguage, version: ApiVersion): SdkGenerationResult {
    return sdkGenerator.generate(language, version);
  }

  supportedLanguages(): { language: SdkLanguage; isReal: boolean }[] {
    return [
      { language: "typescript", isReal: true },
      { language: "javascript", isReal: true },
      { language: "python", isReal: false },
      { language: "php", isReal: false },
      { language: "java", isReal: false },
      { language: "csharp", isReal: false },
    ];
  }
}

export const sdkPlatformAPI = new SDKPlatformAPI();
