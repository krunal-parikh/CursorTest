#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadEnv } from "../config/env.js";
import { closeDb } from "../config/db.js";
import { createThresholdMcpServer } from "./serverFactory.js";
async function main() {
    loadEnv();
    const server = await createThresholdMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    process.on("SIGINT", async () => {
        await server.close();
        await closeDb();
        process.exit(0);
    });
    process.on("SIGTERM", async () => {
        await server.close();
        await closeDb();
        process.exit(0);
    });
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map