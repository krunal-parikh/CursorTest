export function errorHandler(err, _req, res, _next) {
    const requestId = err.requestId ?? _req.requestId;
    const code = err.code ?? "INTERNAL_ERROR";
    const status = err.status ?? (code === "VALIDATION_ERROR" ? 400 : 500);
    const message = err.message ?? "Internal server error";
    res.status(status).json({
        error: {
            code,
            message,
            ...(typeof err.details !== "undefined" ? { details: err.details } : {}),
            requestId,
        },
    });
}
//# sourceMappingURL=errorHandler.js.map