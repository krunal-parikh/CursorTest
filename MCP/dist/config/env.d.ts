import "dotenv/config";
import { z } from "zod";
declare const envSchema: z.ZodObject<{
    MONGODB_URI: z.ZodString;
    MONGODB_DB: z.ZodDefault<z.ZodString>;
    PORT: z.ZodDefault<z.ZodNumber>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<["trace", "debug", "info", "warn", "error"]>>;
}, "strip", z.ZodTypeAny, {
    MONGODB_URI: string;
    MONGODB_DB: string;
    PORT: number;
    LOG_LEVEL: "trace" | "debug" | "info" | "warn" | "error";
}, {
    MONGODB_URI: string;
    MONGODB_DB?: string | undefined;
    PORT?: number | undefined;
    LOG_LEVEL?: "trace" | "debug" | "info" | "warn" | "error" | undefined;
}>;
export type Env = z.infer<typeof envSchema>;
export declare function loadEnv(): Env;
export {};
//# sourceMappingURL=env.d.ts.map