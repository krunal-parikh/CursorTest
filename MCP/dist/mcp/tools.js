import { z } from "zod";
import { resolveDatasource, getResolver } from "../services/datasource/index.js";
import { withValidationToolResult } from "./mcpToolResult.js";
export function registerThresholdTools(server, deps) {
    const { schemaService, holdService, datasourceRepo } = deps;
    server.registerTool("get_schema", {
        title: "Get Schema",
        description: "Retrieve a schema by its key (e.g. hold_entry:add:v1)",
        inputSchema: {
            schemaKey: z.string().describe("Schema key to fetch"),
        },
    }, async ({ schemaKey }) => {
        return withValidationToolResult(async () => {
            const schema = await schemaService.getSchema(schemaKey);
            if (!schema) {
                return {
                    content: [{ type: "text", text: `Schema not found: ${schemaKey}` }],
                    isError: true,
                };
            }
            return {
                content: [
                    { type: "text", text: JSON.stringify(schema, null, 2) },
                ],
                structuredContent: schema,
            };
        });
    });
    server.registerTool("get_hold_entry_search_fields", {
        title: "Get Hold Entry Search Fields",
        description: "Returns all searchable fields with format and allowed values. Call this BEFORE list_hold_entries to know valid filter values. Use plain labels for the user.",
        inputSchema: {},
    }, async () => {
        const schema = await schemaService.getSchema("hold_entry:add:v1");
        if (!schema) {
            return {
                content: [{ type: "text", text: "Schema hold_entry:add:v1 not found." }],
                isError: true,
            };
        }
        const searchFields = [
            { label: "Hold ID", field_name: "holdId", searchFormat: "partial", limitation: "Partial match (e.g. PLT01)" },
            { label: "Status", field_name: "status", searchFormat: "exact", limitation: ["Open", "Closed", "Pending"] },
        ];
        for (const field of schema.fieldConfig.fields) {
            const search = field.search;
            if (!search?.searchable)
                continue;
            searchFields.push({
                label: field.label,
                field_name: field.field_name,
                searchFormat: search.searchFormat ?? "partial",
                limitation: search.limitation ?? "Any value",
            });
        }
        const text = [
            "SEARCHABLE FIELDS (use these in list_hold_entries filter):",
            "",
            ...searchFields.map((f) => `- ${f.label} (${f.field_name}): ${f.searchFormat} match. Allowed: ${JSON.stringify(f.limitation)}`),
        ].join("\n");
        return {
            content: [{ type: "text", text }],
            structuredContent: { searchFields },
        };
    });
    server.registerTool("get_datasource", {
        title: "Get Datasource",
        description: "Get datasource metadata by key",
        inputSchema: {
            datasourceKey: z.string().describe("Datasource key"),
        },
    }, async ({ datasourceKey }) => {
        const resolver = getResolver(datasourceKey);
        const doc = await datasourceRepo.findByKey(datasourceKey);
        const result = {
            key: datasourceKey,
            registered: !!resolver,
            document: doc ?? null,
        };
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            structuredContent: result,
        };
    });
    server.registerTool("resolve_datasource", {
        title: "Resolve Datasource",
        description: "Resolve a datasource (search, lookup by id, paginate)",
        inputSchema: {
            datasourceKey: z.string().describe("Datasource key"),
            search: z.string().optional().describe("Search term"),
            cursor: z.string().optional().describe("Pagination cursor"),
            limit: z.number().optional().describe("Max items (default 20)"),
            lookupId: z.string().optional().describe("Lookup by ID for autopopulate"),
        },
    }, async ({ datasourceKey, search, cursor, limit, lookupId }) => {
        return withValidationToolResult(async () => {
            const result = await resolveDatasource({
                datasourceKey,
                search,
                cursor,
                limit,
                lookupId,
            });
            return {
                content: [
                    { type: "text", text: JSON.stringify(result, null, 2) },
                ],
                structuredContent: result,
            };
        });
    });
    server.registerTool("get_hold_entry_options", {
        title: "Get Hold Entry Options",
        description: "Returns all dropdown choices for creating a hold. ALWAYS call this and SHOW the options to the user before asking them to pick. Use plain language (e.g. 'Category: Product Safety RedFlag, Product Quality RedFlag...'). Never mention schema keys or technical IDs.",
        inputSchema: {},
    }, async () => {
        const schema = await schemaService.getSchema("hold_entry:add:v1");
        if (!schema) {
            return {
                content: [{ type: "text", text: "Schema hold_entry:add:v1 not found." }],
                isError: true,
            };
        }
        const formatOptions = (opts) => opts.map((o, idx) => `${idx + 1}. ${o.label ?? o.value}`).join(", ");
        const getFieldOptions = (fieldName) => {
            const field = schema.fieldConfig.fields.find((f) => f.field_name === fieldName);
            if (!field?.options)
                return "";
            return formatOptions(field.options);
        };
        const result = {
            displayToUser: "Show these options in plain language when asking the user.",
            section1: {
                "MO # / BATCH #": "Search by MO or batch number (use resolve_datasource with mo_lookup). When user picks one, SKU Number, SKU Description, and Plant are filled automatically.",
                "SKU Number": "Filled automatically from MO selection.",
                "SKU Description": "Filled automatically from MO selection.",
                Plant: getFieldOptions("plantCode"),
                "Production Date": "User enters date as mm/dd/yyyy (e.g. 03/05/2025). If they say '5th march', convert it before calling the API.",
                Category: getFieldOptions("category"),
                "Sub-Category": getFieldOptions("subCategory"),
                Observation: getFieldOptions("observation"),
                "Qty on Hold (CS)": "A number.",
                "Plant Related": getFieldOptions("plantRelated"),
                Location: getFieldOptions("location"),
                "LPs / HUs": "Free text.",
                "Additional Notes": "Free text.",
            },
            section2: {
                Status: getFieldOptions("status"),
                "Disposition Provider": getFieldOptions("dispositionProvider"),
                Disposition: getFieldOptions("disposition"),
                "Disposition Provided Target Date": "Date mm/dd/yyyy.",
                "Disposition Actor": getFieldOptions("dispositionActor"),
                "Disposition Action Target Date": "Date mm/dd/yyyy.",
            },
        };
        const text = [
            "OPTIONS TO SHOW THE USER (use plain language, no technical terms):",
            "",
            "Section 1 - Hold Details:",
            `MO # / BATCH #: Search and pick from list. SKU Number, SKU Description, and Plant fill automatically.`,
            `SKU Number / SKU Description: Filled automatically when MO is selected.`,
            `Plant: ${result.section1.Plant}`,
            `Production Date: mm/dd/yyyy format. If user says "5th march", convert to 03/05/2025 before calling API.`,
            `Category: ${result.section1.Category}`,
            `Sub-Category: ${result.section1["Sub-Category"]}`,
            `Observation: ${result.section1.Observation}`,
            `Plant Related: ${result.section1["Plant Related"]}`,
            `Location: ${result.section1.Location}`,
            "",
            "Section 2 - Status & Disposition:",
            `Status: ${result.section2.Status}`,
            `Disposition Provider: ${result.section2["Disposition Provider"]}`,
            `Disposition: ${result.section2.Disposition}`,
            `Disposition Actor: ${result.section2["Disposition Actor"]}`,
        ].join("\n");
        return {
            content: [{ type: "text", text }],
            structuredContent: result,
        };
    });
    server.registerTool("get_hold_entry_workflow", {
        title: "Get Hold Entry Workflow",
        description: "Returns the step-by-step flow for creating a hold. Call get_hold_entry_options FIRST and SHOW options to the user. Use plain language only - no schema keys or IDs.",
        inputSchema: {},
    }, async () => {
        const workflow = {
            steps: [
                {
                    step: 1,
                    action: "Call get_hold_entry_options and SHOW all choices to the user in plain language",
                    critical: "User must SEE the options before choosing. Never ask without showing.",
                },
                {
                    step: 2,
                    action: "Ask: Which MO # / BATCH #? Search and show results as a numbered list. User picks one.",
                    note: "SKU Number, SKU Description, and Plant are filled automatically from the selection.",
                },
                {
                    step: 3,
                    action: "Ask: Production Date? Convert natural language (e.g. '5th march') to mm/dd/yyyy before calling API.",
                },
                {
                    step: 4,
                    action: "Ask: Category? (SHOW: Product Safety RedFlag, Product Quality RedFlag, Testing, etc.)",
                },
                {
                    step: 5,
                    action: "Ask: Sub-Category? (SHOW: Appearance, Taste/Aroma, Metrics, etc.)",
                },
                {
                    step: 6,
                    action: "Ask: Observation? (SHOW: Topping, Texture, Shape, etc.)",
                },
                {
                    step: 7,
                    action: "Ask for Qty on Hold (CS), Plant Related, Location, LPs/HUs, Additional Notes as needed.",
                },
                {
                    step: 8,
                    action: "Ask for Status, Disposition Provider, Disposition, and target dates if relevant.",
                },
                {
                    step: 9,
                    action: "Call preview_hold_entry, SHOW the summary to the user in plain language.",
                },
                {
                    step: 10,
                    action: "Ask: 'Submit this hold?' - only create_record after user says yes.",
                },
            ],
            instructions: "ALWAYS show options before asking. Use plain labels like 'Category', 'MO # / BATCH #', 'Production Date'. Never mention schema keys, field names, or technical IDs.",
        };
        return {
            content: [
                { type: "text", text: JSON.stringify(workflow, null, 2) },
            ],
            structuredContent: workflow,
        };
    });
    server.registerTool("preview_hold_entry", {
        title: "Preview Hold Entry",
        description: "Shows what will be created WITHOUT submitting. Use this to show a summary to the user before they confirm. Call create_record only after user confirms. Dates must be mm/dd/yyyy - convert natural language on your side.",
        inputSchema: {
            moBatchId: z.string().describe("MO number or Batch ID from the list (e.g. MO-001)"),
            prodDate: z.string().describe("Production date in mm/dd/yyyy (convert natural language before calling)"),
            category: z.string().describe("Category (e.g. Product Safety RedFlag, Product Quality RedFlag)"),
            subCategory: z.string().describe("Sub-Category (e.g. Appearance, Taste/Aroma)"),
            observation: z.string().describe("Observation (e.g. Topping, Texture, Shape)"),
            qtyOnHoldCs: z.coerce.number().optional().describe("Quantity on hold in cases"),
            plantRelated: z.string().optional().describe("Plant Related: Yes or No"),
            location: z.string().optional().describe("Location (e.g. LOC1, CRE1)"),
            lpsHus: z.string().optional().describe("LPs / HUs"),
            additionalNotes: z.string().optional().describe("Additional notes"),
            status: z.string().optional().describe("Status (e.g. Disposition Due)"),
            dispositionProvider: z.string().optional().describe("Disposition Provider (QA, PROD, etc.)"),
            disposition: z.string().optional().describe("Disposition (e.g. Approved & Release)"),
            dispositionProvidedTargetDate: z.string().optional().describe("Target date mm/dd/yyyy"),
            dispositionActor: z.string().optional().describe("Disposition Actor (QA, PROD, etc.)"),
            dispositionActionTargetDate: z.string().optional().describe("Target date mm/dd/yyyy"),
        },
    }, async (params) => {
        return withValidationToolResult(async () => {
            const data = {
                moBatchId: params.moBatchId,
                prodDate: params.prodDate,
                category: params.category,
                subCategory: params.subCategory,
                observation: params.observation,
                ...(params.qtyOnHoldCs != null &&
                    !Number.isNaN(params.qtyOnHoldCs) && { qtyOnHoldCs: params.qtyOnHoldCs }),
                ...(params.plantRelated && { plantRelated: params.plantRelated }),
                ...(params.location && { location: params.location }),
                ...(params.lpsHus && { lpsHus: params.lpsHus }),
                ...(params.additionalNotes && { additionalNotes: params.additionalNotes }),
                ...(params.status && { status: params.status }),
                ...(params.dispositionProvider && { dispositionProvider: params.dispositionProvider }),
                ...(params.disposition && { disposition: params.disposition }),
                ...(params.dispositionProvidedTargetDate && {
                    dispositionProvidedTargetDate: params.dispositionProvidedTargetDate,
                }),
                ...(params.dispositionActor && { dispositionActor: params.dispositionActor }),
                ...(params.dispositionActionTargetDate && {
                    dispositionActionTargetDate: params.dispositionActionTargetDate,
                }),
            };
            const { enriched, holdIdPreview } = await holdService.previewHoldEntry("hold_entry:add:v1", data);
            const summary = {
                holdIdPreview,
                data: enriched,
                message: "Review the above. Say 'Submit' or 'Confirm' to create this hold entry.",
            };
            return {
                content: [
                    { type: "text", text: JSON.stringify(summary, null, 2) },
                ],
                structuredContent: summary,
            };
        });
    });
    server.registerTool("create_record", {
        title: "Create Record",
        description: "SUBMIT a hold entry. Call ONLY after: (1) user has seen the preview from preview_hold_entry, and (2) user has confirmed (e.g. 'yes submit', 'confirm'). Never call without confirmation.",
        inputSchema: {
            collection: z
                .enum(["hold_entries"])
                .describe("Collection (hold_entries only)"),
            data: z.record(z.unknown()).describe("Hold data: MO/Batch, Production Date, Category, Sub-Category, Observation, and any other fields the user provided"),
        },
    }, async ({ collection, data }) => {
        return withValidationToolResult(async () => {
            const result = await holdService.createRecord(collection, { schemaKey: "hold_entry:add:v1", ...data }, undefined);
            return {
                content: [
                    { type: "text", text: JSON.stringify(result, null, 2) },
                ],
                structuredContent: result,
            };
        });
    });
    server.registerTool("list_hold_entries", {
        title: "List Hold Entries",
        description: "Search and list existing hold entries. Call get_hold_entry_search_fields FIRST to see valid filter values. You can filter by ANY field: Hold ID, Status, Plant, MO/Batch, Category, Sub-Category, Observation, Location, etc.",
        inputSchema: {
            filter: z
                .record(z.unknown())
                .optional()
                .describe("Filter object. Keys: holdId, status, plantCode, moBatchId, prodDate, category, subCategory, observation, qtyOnHoldCs, plantRelated, location, lpsHus, status, dispositionProvider, disposition, dispositionActor. Use get_hold_entry_search_fields for valid values."),
            limit: z.number().optional().default(20).describe("Max results per page (default 20)"),
            page: z.number().optional().default(1).describe("Page number (default 1)"),
        },
    }, async ({ filter, limit, page }) => {
        return withValidationToolResult(async () => {
            const result = await holdService.listHoldEntries(filter ?? {}, limit ?? 20, page ?? 1);
            return {
                content: [
                    { type: "text", text: JSON.stringify(result, null, 2) },
                ],
                structuredContent: result,
            };
        });
    });
    server.registerTool("get_hold_entry", {
        title: "Get Hold Entry",
        description: "Get a single hold entry by its Hold ID (e.g. PLT01-000001). Use when the user asks for details of a specific hold.",
        inputSchema: {
            holdId: z.string().describe("Hold ID (e.g. PLT01-000001)"),
        },
    }, async ({ holdId }) => {
        return withValidationToolResult(async () => {
            const entry = await holdService.getHoldEntry(holdId);
            if (!entry) {
                return {
                    content: [{ type: "text", text: `Hold entry not found: ${holdId}` }],
                    isError: true,
                };
            }
            const record = {
                holdId: entry.holdId,
                status: entry.status,
                data: entry.data,
                timestamps: entry.timestamps,
            };
            return {
                content: [{ type: "text", text: JSON.stringify(record, null, 2) }],
                structuredContent: record,
            };
        });
    });
}
//# sourceMappingURL=tools.js.map