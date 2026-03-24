import { randomUUID } from "crypto";
export function requestIdMiddleware(req, _res, next) {
    req.requestId = req.headers["x-request-id"] ?? randomUUID();
    next();
}
//# sourceMappingURL=requestId.js.map