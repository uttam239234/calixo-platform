/**
 * Calixo Platform - SDK Generator
 *
 * TypeScript/JavaScript generation is REAL — it emits a genuinely valid,
 * working fetch-based client module derived from the Contract Registry
 * (one typed method per contract). Python/PHP/Java/C# are explicitly
 * "readiness" in the mandate — `generate()` returns `isReal: false` with a
 * clear note for those rather than fabricating client code nobody
 * verified.
 */
import { contractRegistry } from "./ContractRegistry";
import type { ApiContractDefinition, ApiVersion, SdkGenerationResult, SdkLanguage } from "./types";

function methodName(contract: ApiContractDefinition): string {
  const verb = { GET: "get", POST: "create", PUT: "replace", PATCH: "update", DELETE: "remove" }[contract.method];
  const noun = contract.id.replace(/[^a-zA-Z0-9]/g, "_");
  return `${verb}_${noun}`.replace(/_([a-zA-Z0-9])/g, (_, c: string) => c.toUpperCase());
}

export class SdkGenerator {
  generate(language: SdkLanguage, version: ApiVersion): SdkGenerationResult {
    if (language === "typescript" || language === "javascript") {
      return { language, isReal: true, source: this.generateTypescript(version, language === "javascript") };
    }
    return {
      language,
      isReal: false,
      note: `${language} SDK generation is prepared (readiness only, per the mandate) — the Contract Registry has everything a generator needs (schemas, paths, auth requirements); no generator is implemented for ${language} this phase.`,
    };
  }

  private generateTypescript(version: ApiVersion, stripTypes: boolean): string {
    const contracts = contractRegistry.listByVersion(version);
    const methods = contracts.map(contract => this.methodFor(contract, stripTypes)).join("\n\n");

    const header = stripTypes
      ? `/** Calixo API Client (JavaScript) — generated from the Contract Registry. Do not edit by hand. */\nexport class CalixoApiClient {\n  constructor(baseUrl, apiKey) {\n    this.baseUrl = baseUrl;\n    this.apiKey = apiKey;\n  }\n\n  async _request(method, path, body) {\n    const response = await fetch(\`\${this.baseUrl}\${path}\`, {\n      method,\n      headers: { "content-type": "application/json", "x-api-key": this.apiKey },\n      body: body ? JSON.stringify(body) : undefined,\n    });\n    if (!response.ok) throw new Error(\`Calixo API error \${response.status}\`);\n    return response.json();\n  }\n`
      : `/** Calixo API Client (TypeScript) — generated from the Contract Registry. Do not edit by hand. */\nexport class CalixoApiClient {\n  constructor(private baseUrl: string, private apiKey: string) {}\n\n  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {\n    const response = await fetch(\`\${this.baseUrl}\${path}\`, {\n      method,\n      headers: { "content-type": "application/json", "x-api-key": this.apiKey },\n      body: body ? JSON.stringify(body) : undefined,\n    });\n    if (!response.ok) throw new Error(\`Calixo API error \${response.status}\`);\n    return response.json() as Promise<T>;\n  }\n`;

    return `${header}\n${methods}\n}\n`;
  }

  private methodFor(contract: ApiContractDefinition, stripTypes: boolean): string {
    const name = methodName(contract);
    const pathTemplate = contract.path.replace(/\{(\w+)\}/g, "${$1}");
    const params = Array.from(contract.path.matchAll(/\{(\w+)\}/g)).map(m => m[1]);
    const hasBody = contract.method === "POST" || contract.method === "PUT" || contract.method === "PATCH";

    const args = [...params.map(p => stripTypes ? p : `${p}: string`), ...(hasBody ? [stripTypes ? "body" : "body: unknown"] : [])].join(", ");
    const call = `this.${stripTypes ? "_request" : "request"}${stripTypes ? "" : "<unknown>"}("${contract.method}", \`/${contract.version}${pathTemplate}\`${hasBody ? ", body" : ""})`;

    return `  /** ${contract.description} */\n  async ${name}(${args}) {\n    return ${call};\n  }`;
  }
}

export const sdkGenerator = new SdkGenerator();
