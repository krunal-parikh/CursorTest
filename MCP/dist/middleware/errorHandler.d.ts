import type { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface Request {
            requestId?: string;
        }
    }
}
interface AppError {
    code?: string;
    message: string;
    details?: unknown;
}
export declare function errorHandler(err: AppError & {
    status?: number;
}, _req: Request, res: Response, _next: NextFunction): void;
export {};
//# sourceMappingURL=errorHandler.d.ts.map