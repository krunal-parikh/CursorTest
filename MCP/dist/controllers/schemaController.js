import { createSchemaService } from "../services/schemaService.js";
import { getDb } from "../config/db.js";
import { createSchemaRepository } from "../repositories/schemaRepository.js";
export async function getSchema(req, res, next) {
    try {
        const db = getDb();
        const schemaRepo = createSchemaRepository(db);
        const schemaService = createSchemaService(schemaRepo);
        const schema = await schemaService.getSchema(req.params.schemaKey);
        if (!schema) {
            res.status(404).json({
                error: {
                    code: "NOT_FOUND",
                    message: `Schema not found: ${req.params.schemaKey}`,
                    requestId: req.requestId,
                },
            });
            return;
        }
        res.json(schema);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=schemaController.js.map