import type { SchemaDocument } from "../types/schema.js";
/**
 * Validates hold payload against schema (required fields, enums, dates, numbers).
 * Call after auto-populate so derived fields (e.g. plantCode from MO) are present.
 */
export declare function validateHoldEntryData(schema: SchemaDocument, data: Record<string, unknown>): void;
export declare const HOLD_ID_PATTERN: RegExp;
export declare function assertValidHoldId(holdId: string): void;
export declare function normalizeListParams(limit: number, page: number): {
    limit: number;
    page: number;
};
//# sourceMappingURL=validateHoldEntryData.d.ts.map