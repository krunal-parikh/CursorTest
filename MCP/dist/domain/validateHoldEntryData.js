import { AppValidationError } from "./appError.js";
const DATE_RE = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
function issuesError(issues) {
    const lines = issues.map((i) => `${i.path}: ${i.message}`);
    return new AppValidationError(lines.join("; "), issues);
}
function normalizeString(v) {
    if (v == null)
        return undefined;
    if (typeof v === "string") {
        const t = v.trim();
        return t === "" ? undefined : t;
    }
    return String(v).trim() === "" ? undefined : String(v).trim();
}
function normalizeNumber(v) {
    if (v == null || v === "")
        return undefined;
    if (typeof v === "number" && Number.isFinite(v))
        return v;
    if (typeof v === "string") {
        const n = parseFloat(v.trim());
        if (Number.isFinite(n))
            return n;
    }
    return undefined;
}
function isEmptyValue(field, raw) {
    const comp = field["ui.component"];
    if (raw == null || raw === "")
        return true;
    if (comp === "number") {
        return normalizeNumber(raw) === undefined;
    }
    return normalizeString(raw) === undefined;
}
function applyFieldRules(field, raw, issues) {
    const path = field.field_name;
    const label = field.label ?? path;
    if (field.required && isEmptyValue(field, raw)) {
        issues.push({ path, message: `${label} is required` });
        return;
    }
    if (isEmptyValue(field, raw))
        return;
    const strVal = normalizeString(raw);
    const numVal = normalizeNumber(raw);
    if (field["ui.component"] === "number") {
        if (numVal === undefined) {
            issues.push({ path, message: `${label} must be a number` });
            return;
        }
        const lim = field.search?.limitation;
        if (lim && typeof lim === "object" && !Array.isArray(lim)) {
            if (lim.min != null && numVal < lim.min) {
                issues.push({ path, message: `${label} must be >= ${lim.min}` });
            }
            if (lim.max != null && numVal > lim.max) {
                issues.push({ path, message: `${label} must be <= ${lim.max}` });
            }
        }
        return;
    }
    if (strVal === undefined)
        return;
    if (field["ui.component"] === "date" || path.toLowerCase().endsWith("date")) {
        if (!DATE_RE.test(strVal)) {
            issues.push({
                path,
                message: `${label} must be mm/dd/yyyy (e.g. 03/05/2025)`,
            });
        }
        return;
    }
    if (field.options && field.options.length > 0) {
        const allowed = new Set(field.options.map((o) => o.value));
        if (!allowed.has(strVal)) {
            issues.push({
                path,
                message: `${label} must be one of: ${[...allowed].join(", ")}`,
            });
        }
    }
    const lim = field.search?.limitation;
    if (field["ui.component"] === "text" || field["ui.component"] === "textarea") {
        if (typeof lim === "object" && lim != null && !Array.isArray(lim) && lim.maxLength != null) {
            if (strVal.length > lim.maxLength) {
                issues.push({
                    path,
                    message: `${label} must be at most ${lim.maxLength} characters`,
                });
            }
        }
    }
    if (field.validation) {
        for (const rule of field.validation) {
            if (rule.type === "minLength" && typeof rule.value === "number" && strVal.length < rule.value) {
                issues.push({
                    path,
                    message: rule.message ?? `${label} must be at least ${rule.value} characters`,
                });
            }
            if (rule.type === "maxLength" && typeof rule.value === "number" && strVal.length > rule.value) {
                issues.push({
                    path,
                    message: rule.message ?? `${label} must be at most ${rule.value} characters`,
                });
            }
            if (rule.type === "pattern" && typeof rule.value === "string") {
                try {
                    const re = new RegExp(rule.value);
                    if (!re.test(strVal)) {
                        issues.push({ path, message: rule.message ?? `${label} has invalid format` });
                    }
                }
                catch {
                    /* ignore bad pattern in schema */
                }
            }
        }
    }
}
/**
 * Validates hold payload against schema (required fields, enums, dates, numbers).
 * Call after auto-populate so derived fields (e.g. plantCode from MO) are present.
 */
export function validateHoldEntryData(schema, data) {
    const issues = [];
    for (const field of schema.fieldConfig.fields) {
        applyFieldRules(field, data[field.field_name], issues);
    }
    if (issues.length > 0)
        throw issuesError(issues);
}
export const HOLD_ID_PATTERN = /^[A-Z0-9]+-\d{6}$/i;
export function assertValidHoldId(holdId) {
    const t = holdId?.trim() ?? "";
    if (!t) {
        throw new AppValidationError("Hold ID is required", [{ path: "holdId", message: "Hold ID is required" }]);
    }
    if (!HOLD_ID_PATTERN.test(t)) {
        throw new AppValidationError("Invalid hold ID format", [
            {
                path: "holdId",
                message: "Expected format like PLT01-000001 (plant code + 6-digit sequence)",
            },
        ]);
    }
}
export function normalizeListParams(limit, page) {
    const issues = [];
    if (!Number.isFinite(limit) || limit < 1) {
        issues.push({ path: "limit", message: "limit must be a number >= 1" });
    }
    if (limit > 100) {
        issues.push({ path: "limit", message: "limit must be at most 100" });
    }
    if (!Number.isFinite(page) || page < 1) {
        issues.push({ path: "page", message: "page must be a number >= 1" });
    }
    if (issues.length)
        throw issuesError(issues);
    return {
        limit: Math.floor(limit),
        page: Math.floor(page),
    };
}
//# sourceMappingURL=validateHoldEntryData.js.map