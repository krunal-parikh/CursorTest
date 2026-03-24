import { z } from "zod";
declare const envSchema: z.ZodObject<{
    MONGODB_URI: z.ZodString;
    MONGODB_DB: z.ZodDefault<z.ZodString>;
    PORT: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    MONGODB_URI: string;
    MONGODB_DB: string;
    PORT: number;
}, {
    MONGODB_URI: string;
    MONGODB_DB?: string | undefined;
    PORT?: number | undefined;
}>;
export type Env = z.infer<typeof envSchema>;
export declare function loadEnv(): Env;
export {};
//# sourceMappingURL=env.d.ts.map