import { config } from "dotenv";
import { z } from "zod";
import { resolve } from "path";

// Load .env from mcp-schema-ui or parent project
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "..", ".env") });
const parentEnv = resolve(process.cwd(), "..", ".env");

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_DB: z.string().min(1).default("threshold"),
  PORT: z.coerce.number().int().positive().default(3200),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment:", result.error.flatten());
    throw new Error("Invalid environment configuration");
  }
  return result.data;
}
