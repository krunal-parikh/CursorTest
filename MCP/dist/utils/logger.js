import pino from "pino";
import { loadEnv } from "../config/env.js";
const env = loadEnv();
export const logger = pino({
    level: env.LOG_LEVEL,
    transport: env.LOG_LEVEL === "debug" || env.LOG_LEVEL === "trace"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
});
//# sourceMappingURL=logger.js.map