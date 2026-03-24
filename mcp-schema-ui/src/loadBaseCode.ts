import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Resolves the frontend src path.
 * From dist/loadBaseCode.js: dist -> mcp-schema-ui -> MCP -> frontend/src
 */
function getFrontendSrcPath(): string {
  const mcpSchemaUiDir = resolve(__dirname, "..");
  const projectRoot = resolve(mcpSchemaUiDir, "..");
  return resolve(projectRoot, "frontend", "src");
}

export interface BaseCode {
  schemaForm: string;
  schemaTypes: string;
  apiClient: string;
  instructions: string;
}

const INSTRUCTIONS = `## Instructions for Claude

This is the **base UI** for rendering schema-driven forms. The user can customize:
- **Colors** – Change CSS variables, className styles, or add a theme
- **Typography** – Font family, sizes, weights in the form
- **Positions** – Layout, grid, flexbox, field order, grouping

### How it works
1. **SchemaForm.tsx** – Main React component. Fetches schema from API, renders fields via FieldRenderer. Supports text, select, number, date, textarea. Has autopopulate (e.g. MO/Batch fills SKU, Plant).
2. **schema.ts** – TypeScript types for the schema structure.
3. **api/client.ts** – API calls: getSchema, resolveDatasource, createHoldEntry.

### Customization tips
- Add \`className\` or inline styles to \`<div className="schema-form">\`, \`<div className="form-group">\`, etc.
- Use CSS variables for colors: \`--primary-color\`, \`--font-family\`
- Change \`form-grid\` to a different layout (flex, grid, columns)
- Reorder fields by changing the \`fields.map()\` or grouping logic
- For schemaKey: the base uses "hold_entry:add:v1" – make it a prop to support any schema`;

export function loadBaseCode(): BaseCode | null {
  const frontendSrc = getFrontendSrcPath();

  const schemaFormPath = resolve(frontendSrc, "components", "SchemaForm.tsx");
  const schemaTypesPath = resolve(frontendSrc, "types", "schema.ts");
  const apiClientPath = resolve(frontendSrc, "api", "client.ts");

  if (!existsSync(schemaFormPath) || !existsSync(schemaTypesPath) || !existsSync(apiClientPath)) {
    return null;
  }

  return {
    schemaForm: readFileSync(schemaFormPath, "utf-8"),
    schemaTypes: readFileSync(schemaTypesPath, "utf-8"),
    apiClient: readFileSync(apiClientPath, "utf-8"),
    instructions: INSTRUCTIONS,
  };
}
