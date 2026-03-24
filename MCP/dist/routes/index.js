import { Router } from "express";
import { getSchema } from "../controllers/schemaController.js";
import { resolveDatasourceHandler } from "../controllers/datasourceController.js";
import { createHoldEntry, getHoldEntry, listHoldEntries } from "../controllers/holdEntryController.js";
import { validateBody } from "../middleware/validation.js";
import { z } from "zod";
const holdEntrySchema = z.object({
    schemaKey: z.string().optional().default("hold_entry:add:v1"),
    data: z.record(z.unknown()).optional(),
}).passthrough();
const router = Router();
router.get("/healthz", (_req, res) => res.json({ status: "ok" }));
router.get("/readyz", async (req, res) => {
    try {
        const { getDb } = await import("../config/db.js");
        getDb();
        res.json({ status: "ready" });
    }
    catch {
        res.status(503).json({ status: "not ready" });
    }
});
router.get("/schemas/:schemaKey", getSchema);
const resolveBodySchema = z.object({
    search: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    lookupId: z.string().optional(),
});
router.post("/datasources/:datasourceKey/resolve", validateBody(resolveBodySchema), resolveDatasourceHandler);
router.post("/hold-entries", validateBody(holdEntrySchema), createHoldEntry);
router.get("/hold-entries", listHoldEntries);
router.get("/hold-entries/:holdId", getHoldEntry);
export default router;
//# sourceMappingURL=index.js.map