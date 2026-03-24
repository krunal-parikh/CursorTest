import type { Request, Response, NextFunction } from "express";
import type { z } from "zod";
export declare function validateBody<T extends z.ZodType>(schema: T): (req: Request, _res: Response, next: NextFunction) => void;
export declare function validateQuery<T extends z.ZodType>(schema: T): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.d.ts.map