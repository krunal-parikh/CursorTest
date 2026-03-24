export function validateBody(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            next({
                code: "VALIDATION_ERROR",
                message: "Validation failed",
                details: result.error.flatten(),
                status: 400,
            });
            return;
        }
        req.body = result.data;
        next();
    };
}
export function validateQuery(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            next({
                code: "VALIDATION_ERROR",
                message: "Query validation failed",
                details: result.error.flatten(),
                status: 400,
            });
            return;
        }
        req.query = result.data;
        next();
    };
}
//# sourceMappingURL=validation.js.map