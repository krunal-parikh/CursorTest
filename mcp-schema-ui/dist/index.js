import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadEnv } from "./config/env.js";
import { connectDb, closeDb, getDb } from "./config/db.js";
import { registerSchemaUiTools } from "./tools.js";
async function main() {
    const env = loadEnv();
    await connectDb();
    const db = getDb();
    const server = new McpServer({
        name: "mcp-schema-ui",
        version: "1.0.0",
    });
    registerSchemaUiTools(server, db);
    const app = createMcpExpressApp({ host: "0.0.0.0" });
    app.post("/mcp", async (req, res) => {
        try {
            const transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined,
            });
            await server.connect(transport);
            await transport.handleRequest(req, res, req.body);
            res.on("close", () => {
                transport.close();
                server.close();
            });
        }
        catch (error) {
            console.error("Error handling MCP request:", error);
            if (!res.headersSent) {
                res.status(500).json({
                    jsonrpc: "2.0",
                    error: { code: -32603, message: "Internal server error" },
                    id: null,
                });
            }
        }
    });
    app.get("/mcp", (_req, res) => {
        res.status(405).json({
            jsonrpc: "2.0",
            error: { code: -32000, message: "Method not allowed. Use POST." },
            id: null,
        });
    });
    app.get("/healthz", (_req, res) => res.json({ status: "ok" }));
    const port = env.PORT;
    const httpServer = app.listen(port, () => {
        console.log(`MCP Schema UI server listening on port ${port}`);
        console.log(`MCP endpoint: http://0.0.0.0:${port}/mcp`);
    });
    const shutdown = async () => {
        httpServer.close();
        await closeDb();
        process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map