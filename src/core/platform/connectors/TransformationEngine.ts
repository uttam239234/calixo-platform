/**
 * Calixo Platform - Transformation Platform
 *
 * Applies a connector manifest's declared `TransformationRule[]` to
 * already-normalized Universal records: calculated fields, cleaning,
 * filtering, formatting, enrichment, validation, and defaults — real rule
 * execution via `evaluateSafeExpression` (no `eval`), not a placeholder.
 */
import { evaluateSafeExpression } from "./SafeExpressionEvaluator";
import type { TransformationRule } from "./types";

function formatValue(value: unknown, formatter: NonNullable<TransformationRule["formatter"]>): unknown {
  switch (formatter) {
    case "uppercase": return typeof value === "string" ? value.toUpperCase() : value;
    case "lowercase": return typeof value === "string" ? value.toLowerCase() : value;
    case "trim": return typeof value === "string" ? value.trim() : value;
    case "round2": return typeof value === "number" ? Math.round(value * 100) / 100 : value;
    case "iso_date": return value ? new Date(value as string | number).toISOString() : value;
    default: return value;
  }
}

export interface TransformationResult<T> {
  records: T[];
  droppedCount: number;
  validationErrors: { record: T; field: string; rule: TransformationRule }[];
}

export class TransformationEngine {
  private appliedCount = 0;

  apply<T extends Record<string, unknown>>(rules: TransformationRule[], records: T[]): TransformationResult<T> {
    const validationErrors: TransformationResult<T>["validationErrors"] = [];
    let working = [...records];

    for (const rule of rules) {
      switch (rule.kind) {
        case "default_value":
          working = working.map(record => (record[rule.field] === undefined || record[rule.field] === null) ? { ...record, [rule.field]: rule.value } : record);
          break;

        case "data_cleaning":
          working = working.map(record => typeof record[rule.field] === "string" ? { ...record, [rule.field]: (record[rule.field] as string).trim().replace(/\s+/g, " ") } : record);
          break;

        case "formatting":
          if (rule.formatter) {
            working = working.map(record => ({ ...record, [rule.field]: formatValue(record[rule.field], rule.formatter!) }));
          }
          break;

        case "calculated_field":
          if (rule.expression) {
            working = working.map(record => ({ ...record, [rule.field]: evaluateSafeExpression(rule.expression!, record) }));
          }
          break;

        case "filter":
          if (rule.expression) {
            working = working.filter(record => Boolean(evaluateSafeExpression(rule.expression!, record)));
          }
          break;

        case "enrichment":
          working = working.map(record => (record[rule.field] === undefined) ? { ...record, [rule.field]: rule.value } : record);
          break;

        case "validation":
          if (rule.expression) {
            working = working.filter(record => {
              const isValid = Boolean(evaluateSafeExpression(rule.expression!, record));
              if (!isValid) validationErrors.push({ record, field: rule.field, rule });
              return isValid;
            });
          }
          break;

        case "field_mapping":
          // Normalization already applies declared field mappings — this
          // rule kind exists for post-normalization renames.
          if (rule.expression) {
            working = working.map(record => ({ ...record, [rule.field]: getField(record, rule.expression!) }));
          }
          break;
      }
    }

    this.appliedCount += rules.length;
    return { records: working, droppedCount: records.length - working.length, validationErrors };
  }

  count(): number {
    return this.appliedCount;
  }
}

function getField(record: Record<string, unknown>, path: string): unknown {
  return record[path];
}

export const transformationEngine = new TransformationEngine();
