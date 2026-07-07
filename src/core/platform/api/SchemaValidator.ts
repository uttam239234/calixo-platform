/**
 * Calixo Platform - Schema Validator
 *
 * A real, hand-rolled request/response validator — no external validation
 * library is added (none existed in this codebase before this phase;
 * every other engine in this program — `PolicyCondition`, transformation
 * rules, the safe expression evaluator — is similarly self-contained
 * rather than pulling in a new dependency). The SAME `ApiSchema` also
 * drives OpenAPI generation (`OpenApiGenerator.ts`), so a contract author
 * writes the shape once.
 */
import type { ApiSchema, SchemaField, ValidationIssue, ValidationResult } from "./types";

function validateField(field: SchemaField, value: unknown, path: string, errors: ValidationIssue[]): void {
  if (value === undefined || value === null) {
    if (field.required) errors.push({ field: path, message: "is required" });
    return;
  }

  switch (field.type) {
    case "string":
      if (typeof value !== "string") { errors.push({ field: path, message: "must be a string" }); return; }
      if (field.enum && !field.enum.includes(value)) errors.push({ field: path, message: `must be one of: ${field.enum.join(", ")}` });
      if (field.pattern && !new RegExp(field.pattern).test(value)) errors.push({ field: path, message: `does not match pattern ${field.pattern}` });
      break;

    case "number":
      if (typeof value !== "number" || Number.isNaN(value)) { errors.push({ field: path, message: "must be a number" }); return; }
      if (field.minimum !== undefined && value < field.minimum) errors.push({ field: path, message: `must be >= ${field.minimum}` });
      if (field.maximum !== undefined && value > field.maximum) errors.push({ field: path, message: `must be <= ${field.maximum}` });
      break;

    case "boolean":
      if (typeof value !== "boolean") errors.push({ field: path, message: "must be a boolean" });
      break;

    case "array":
      if (!Array.isArray(value)) { errors.push({ field: path, message: "must be an array" }); return; }
      if (field.items && typeof field.items === "object") {
        value.forEach((item, i) => validateObject(field.items as ApiSchema, item as Record<string, unknown>, `${path}[${i}]`, errors));
      } else if (field.items && typeof field.items === "string") {
        value.forEach((item, i) => validateField({ name: `${path}[${i}]`, type: field.items as SchemaField["type"] }, item, `${path}[${i}]`, errors));
      }
      break;

    case "object":
      if (typeof value !== "object" || Array.isArray(value)) { errors.push({ field: path, message: "must be an object" }); return; }
      if (field.properties) {
        for (const prop of field.properties) {
          validateField(prop, (value as Record<string, unknown>)[prop.name], `${path}.${prop.name}`, errors);
        }
      }
      break;
  }
}

function validateObject(schema: ApiSchema, data: Record<string, unknown>, path: string, errors: ValidationIssue[]): void {
  for (const field of schema.fields) {
    validateField(field, data?.[field.name], path ? `${path}.${field.name}` : field.name, errors);
  }
}

export class SchemaValidator {
  validate(schema: ApiSchema, data: unknown): ValidationResult {
    const errors: ValidationIssue[] = [];
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return { valid: false, errors: [{ field: schema.name, message: "request body must be a JSON object" }] };
    }
    validateObject(schema, data as Record<string, unknown>, "", errors);
    return { valid: errors.length === 0, errors };
  }
}

export const schemaValidator = new SchemaValidator();
