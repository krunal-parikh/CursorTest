import { resolveDatasource } from "../services/datasource/index.js";
export async function resolveDatasourceHandler(req, res, next) {
    try {
        const datasourceKey = req.params.datasourceKey;
        const body = req.body;
        const result = await resolveDatasource({
            datasourceKey,
            search: body.search,
            cursor: body.cursor,
            limit: body.limit,
            lookupId: body.lookupId,
        });
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=datasourceController.js.map