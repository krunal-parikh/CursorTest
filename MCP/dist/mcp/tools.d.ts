import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { createSchemaService } from "../services/schemaService.js";
import type { createHoldEntryService } from "../services/holdEntryService.js";
import type { createDatasourceRepository } from "../repositories/datasourceRepository.js";
export declare function registerThresholdTools(server: McpServer, deps: {
    schemaService: ReturnType<typeof createSchemaService>;
    holdService: ReturnType<typeof createHoldEntryService>;
    datasourceRepo: ReturnType<typeof createDatasourceRepository>;
}): void;
//# sourceMappingURL=tools.d.ts.map