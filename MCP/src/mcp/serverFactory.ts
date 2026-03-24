import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { connectDb, getDb } from "../config/db.js";
import { createSchemaRepository } from "../repositories/schemaRepository.js";
import { createSchemaService } from "../services/schemaService.js";
import { createHoldEntryService } from "../services/holdEntryService.js";
import { createDatasourceRepository } from "../repositories/datasourceRepository.js";
import { registerResolver, createMoLookupResolver } from "../services/datasource/index.js";
import { createMoLookupRepository } from "../repositories/moLookupRepository.js";
import { registerThresholdTools } from "./tools.js";

export async function createThresholdMcpServer(): Promise<McpServer> {
  await connectDb();
  const db = getDb();
  const moLookupRepo = createMoLookupRepository(db);
  registerResolver(
    createMoLookupResolver("mo_lookup", {
      findById: moLookupRepo.findById.bind(moLookupRepo),
      findByMoBatchId: moLookupRepo.findByMoBatchId.bind(moLookupRepo),
      search: moLookupRepo.search.bind(moLookupRepo),
    })
  );
  const schemaRepo = createSchemaRepository(db);
  const schemaService = createSchemaService(schemaRepo);
  const holdService = createHoldEntryService(db);
  const datasourceRepo = createDatasourceRepository(db);
  const server = new McpServer({
    name: "threshold-mcp",
    version: "1.0.0",
  });
  registerThresholdTools(server, {
    schemaService,
    holdService,
    datasourceRepo,
  });
  return server;
}
