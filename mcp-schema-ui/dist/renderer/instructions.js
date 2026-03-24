/**
 * Instructions passed to Claude with the base UI and schema.
 */
export const BASE_UI_INSTRUCTIONS = `## Base UI Instructions

This is the **base UI** that renders any schema. It contains:

1. **Base template source** – The full HTML + CSS + JS logic. It reads the schema from \`<script id="schema-data">\` and renders form fields based on \`ui.component\` (text, select, number, date, textarea).

2. **Schema** – The data that defines the form fields (labels, types, options, required, etc.).

3. **Rendered output** – The complete HTML with the schema embedded, ready to display.

### How the user can customize (no code changes to logic):

- **Colors**: Edit the \`:root\` CSS variables: \`--color-primary\`, \`--color-primary-hover\`, \`--color-text\`, \`--color-border\`, \`--color-bg\`
- **Typography**: \`--font-family\`, \`--font-size-base\`, \`--font-size-title\`, \`--font-weight-label\`
- **Spacing**: \`--spacing-unit\`, \`--form-gap\`, \`--form-max-width\`
- **Layout/positions**: Change \`.form-grid { grid-template-columns: 1fr 1fr; }\` for 2 columns, or use \`flex\` for different arrangements

The user can edit the HTML directly to change colors, typography, and positions. The rendering logic stays the same.`;
//# sourceMappingURL=instructions.js.map