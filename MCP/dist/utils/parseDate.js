/**
 * Parses natural language dates (e.g. "5th march", "march 5") to mm/dd/yyyy.
 * Business users can say things like "5th march" and we convert to a proper date.
 */
const MONTHS = {
    january: 1, jan: 1,
    february: 2, feb: 2,
    march: 3, mar: 3,
    april: 4, apr: 4,
    may: 5,
    june: 6, jun: 6,
    july: 7, jul: 7,
    august: 8, aug: 8,
    september: 9, sep: 9, sept: 9,
    october: 10, oct: 10,
    november: 11, nov: 11,
    december: 12, dec: 12,
};
/**
 * Parse a date string that may be natural language or mm/dd/yyyy.
 * Returns mm/dd/yyyy format, or null if unparseable.
 */
export function parseNaturalDate(input) {
    if (!input || typeof input !== "string")
        return null;
    const trimmed = input.trim();
    if (!trimmed)
        return null;
    // Already mm/dd/yyyy or m/d/yyyy
    const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
        const [, m, d, y] = slashMatch;
        const month = parseInt(m, 10);
        const day = parseInt(d, 10);
        const year = parseInt(y, 10);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}/${year}`;
        }
    }
    // Natural: "5th march", "march 5", "march 5th", "5 march 2025"
    const lower = trimmed.toLowerCase();
    const year = new Date().getFullYear();
    // Pattern: "5th march" or "5 march" or "march 5" or "march 5th"
    const ordinals = ["st", "nd", "rd", "th"];
    let day = null;
    let month = null;
    let parsedYear = year;
    // Try "Xth month" or "X month"
    for (const ord of ordinals) {
        const re1 = new RegExp(`^(\\d{1,2})${ord}?\\s+(\\w+)(?:\\s+(\\d{4}))?$`, "i");
        const m1 = lower.match(re1);
        if (m1 && m1[1] && m1[2]) {
            day = parseInt(m1[1], 10);
            const monthName = m1[2];
            month = MONTHS[monthName] ?? null;
            if (m1[3])
                parsedYear = parseInt(m1[3], 10);
            break;
        }
    }
    if (!month && !day) {
        // Try "month X" or "month Xth"
        const re2 = /^(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?$/i;
        const m2 = lower.match(re2);
        if (m2 && m2[1] && m2[2]) {
            const monthName = m2[1];
            month = MONTHS[monthName] ?? null;
            day = parseInt(m2[2], 10);
            if (m2[3])
                parsedYear = parseInt(m2[3], 10);
        }
    }
    if (month && day && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}/${parsedYear}`;
    }
    // Fallback: try native Date
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
        const m = d.getMonth() + 1;
        const dayNum = d.getDate();
        const y = d.getFullYear();
        return `${String(m).padStart(2, "0")}/${String(dayNum).padStart(2, "0")}/${y}`;
    }
    return null;
}
//# sourceMappingURL=parseDate.js.map