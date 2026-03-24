#!/usr/bin/env node
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { loadEnv } from "../config/env.js";
import { closeDb } from "../config/db.js";
import { createThresholdMcpServer } from "./serverFactory.js";

async function main() {
  loadEnv();
  const port = process.env.MCP_HTTP_PORT ? parseInt(process.env.MCP_HTTP_PORT, 10) : 3100;

  const app = createMcpExpressApp({
    host: "0.0.0.0",
  });

  app.post("/mcp", async (req, res) => {
    try {
      const server = await createThresholdMcpServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on("close", () => {
        transport.close();
        server.close();
      });
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
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

  const httpServer = app.listen(port, () => {
    console.log(`ThresHOLD MCP HTTP server listening on port ${port}`);
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
