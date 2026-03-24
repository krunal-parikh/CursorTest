import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDb, getDb } from "./config/db.js";
import { loadEnv } from "./config/env.js";
import { createSchemaRepository } from "./repositories/schemaRepository.js";
import { createMoLookupRepository } from "./repositories/moLookupRepository.js";
import { createSchemaService } from "./services/schemaService.js";
import { createMoLookupResolver } from "./services/datasource/moLookupResolver.js";
import { registerResolver, resolveDatasource, getResolver } from "./services/datasource/registry.js";
import { createDatasourceRepository } from "./repositories/datasourceRepository.js";
import { isAppValidationError } from "./domain/appError.js";
import {
  createHoldEntry,
  getHoldEntry,
  listHoldEntries,
  previewHoldEntry,
} from "./controllers/holdEntryController.js";

async function main() {
  const env = loadEnv();
  await connectDb();
  const db = getDb();

  const schemaRepo = createSchemaRepository(db);
  const schemaService = createSchemaService(schemaRepo);
  const moLookupRepo = createMoLookupRepository(db);
  const moLookupResolver = createMoLookupResolver("mo_lookup", {
    findById: moLookupRepo.findById.bind(moLookupRepo),
    findByMoBatchId: moLookupRepo.findByMoBatchId.bind(moLookupRepo),
    search: moLookupRepo.search.bind(moLookupRepo),
  });
  registerResolver(moLookupResolver);

  const datasourceRepo = createDatasourceRepository(db);

  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.use((req, _res, next) => {
    req.requestId = crypto.randomUUID?.() ?? `req-${Date.now()}`;
    next();
  });

  app.get("/schemas/:schemaKey", async (req, res, next) => {
    try {
      const schema = await schemaService.getSchema(req.params.schemaKey);
      if (!schema) {
        res.status(404).json({ error: "Schema not found", schemaKey: req.params.schemaKey });
        return;
      }
      res.json(schema);
    } catch (err) {
      next(err);
    }
  });

  app.get("/datasources/:datasourceKey", async (req, res, next) => {
    try {
      const datasourceKey = req.params.datasourceKey?.trim() ?? "";
      if (!datasourceKey) {
        res.status(400).json({
          error: "datasourceKey is required",
          issues: [{ path: "datasourceKey", message: "datasourceKey is required" }],
        });
        return;
      }
      const doc = await datasourceRepo.findByKey(datasourceKey);
      const result = {
        key: datasourceKey,
        registered: !!getResolver(datasourceKey),
        document: doc ?? null,
      };
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  app.post("/datasources/:datasourceKey/resolve", async (req, res, next) => {
    try {
      const datasourceKey = req.params.datasourceKey;
      const body = (req.body ?? {}) as {
        search?: string;
        lookupId?: string;
        limit?: number;
        cursor?: string;
      };
      const result = await resolveDatasource({
        datasourceKey,
        search: body.search,
        lookupId: body.lookupId,
        limit: body.limit,
        cursor: body.cursor,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  app.post("/hold-entries/preview", previewHoldEntry);
  app.get("/hold-entries", listHoldEntries);
  app.get("/hold-entries/:holdId", getHoldEntry);
  app.post("/hold-entries", createHoldEntry);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (isAppValidationError(err)) {
      res.status(400).json({
        error: err.message,
        issues: err.issues,
      });
      return;
    }
    console.error(err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  });

  const port = env.PORT;
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
