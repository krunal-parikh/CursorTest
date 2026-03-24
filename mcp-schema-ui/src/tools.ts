import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Db } from "mongodb";
import { listSchemas, getSchema } from "./services/schemaService.js";
import { loadBaseCode } from "./loadBaseCode.js";

export function registerSchemaUiTools(server: McpServer, db: Db): void {
  server.registerTool(
    "list_schemas",
    {
      title: "List Schemas",
      description:
        "List all active schemas from MongoDB. Use this to discover available schema keys before fetching schema and React base code.",
      inputSchema: {},
    },
    async () => {
      const schemas = await listSchemas(db);
      const text = schemas.length
        ? schemas.map((s) => `- ${s.schemaKey} (${s.version})`).join("\n")
        : "No schemas found.";
      return {
        content: [{ type: "text" as const, text: `Available schemas:\n\n${text}` }],
        structuredContent: { schemas } as Record<string, unknown>,
      };
    }
  );

  server.registerTool(
    "get_schema_with_react_base",
    {
      title: "Get Schema with React Base Code",
      description:
        "Fetches a schema from MongoDB and returns the schema JSON plus the full React base code (SchemaForm.tsx, types, API client). This is the base UI for rendering the schema. The user can customize colors, typography, positions. Use this when the user wants to modify the form UI.",
      inputSchema: {
        schemaKey: z.string().describe("Schema key (e.g. hold_entry:add:v1)"),
      },
    },
    async ({ schemaKey }) => {
      const schema = await getSchema(db, schemaKey);
      if (!schema) {
        return {
          content: [{ type: "text" as const, text: `Schema not found: ${schemaKey}` }],
          isError: true,
        };
      }

      const baseCode = loadBaseCode();
      if (!baseCode) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Schema found but base code not available. Ensure frontend/src/components/SchemaForm.tsx exists in the project.`,
            },
          ],
          isError: true,
        };
      }

      const schemaJson = JSON.stringify(schema, null, 2);

      const text = [
        `## Schema: ${schemaKey}`,
        "",
        "### Schema JSON",
        "```json",
        schemaJson,
        "```",
        "",
        "---",
        "",
        baseCode.instructions,
        "",
        "---",
        "",
        "### Base Code (React)",
        "",
        "#### frontend/src/types/schema.ts",
        "```typescript",
        baseCode.schemaTypes,
        "```",
        "",
        "#### frontend/src/api/client.ts",
        "```typescript",
        baseCode.apiClient,
        "```",
        "",
        "#### frontend/src/components/SchemaForm.tsx",
        "```tsx",
        baseCode.schemaForm,
        "```",
      ].join("\n");

      return {
        content: [{ type: "text" as const, text }],
        structuredContent: {
          schemaKey,
          schema,
          baseCode: {
            schemaForm: baseCode.schemaForm,
            schemaTypes: baseCode.schemaTypes,
            apiClient: baseCode.apiClient,
            instructions: baseCode.instructions,
          },
        } as Record<string, unknown>,
      };
    }
  );

  server.registerTool(
    "get_schema",
    {
      title: "Get Schema",
      description:
        "Retrieve a schema by its key from MongoDB. Returns the schema JSON with field definitions. Use this when you only need the schema (e.g. to render a form or understand field structure) without the React base code.",
      inputSchema: {
        schemaKey: z.string().describe("Schema key (e.g. hold_entry:add:v1)"),
      },
    },
    async ({ schemaKey }) => {
      const schema = await getSchema(db, schemaKey);
      if (!schema) {
        return {
          content: [{ type: "text" as const, text: `Schema not found: ${schemaKey}` }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify(schema, null, 2) }],
        structuredContent: schema as unknown as Record<string, unknown>,
      };
    }
  );
}
