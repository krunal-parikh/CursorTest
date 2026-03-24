import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkitnext/agent";
import { createOpenAI } from "@ai-sdk/openai";
import { NextRequest } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

type McpServerEntry = { url: string; type?: "http" | "sse" };

let cachedMcpServers: { type: "http"; url: string }[] | null = null;

// Easy MCP integration: load from mcp.json first, then env, then default.
// Cached per process to avoid disk + parse on every chat request (orchestration latency).
function getMcpServers(): { type: "http"; url: string }[] {
  if (cachedMcpServers) return cachedMcpServers;

  const cwd = process.cwd();
  const mcpPath = join(cwd, "mcp.json");

  if (existsSync(mcpPath)) {
    try {
      const raw = readFileSync(mcpPath, "utf-8");
      const config = JSON.parse(raw) as { servers?: (McpServerEntry | string)[] };
      const servers = config.servers ?? [];
      if (servers.length > 0) {
        cachedMcpServers = servers.map((s) => ({
          type: "http" as const,
          url: typeof s === "string" ? s : s.url,
        }));
        return cachedMcpServers;
      }
    } catch {
      // fall through to env
    }
  }

  const urls =
    process.env.MCP_URLS?.split(",").map((u) => u.trim()).filter(Boolean) ??
    (process.env.MCP_URL ? [process.env.MCP_URL] : []);
  if (urls.length === 0) urls.push("http://localhost:3100/mcp");
  cachedMcpServers = urls.map((url) => ({ type: "http" as const, url }));
  return cachedMcpServers;
}

// Resolve model: Azure OpenAI when AZURE_OPENAI_* set (uses createOpenAI via baseURL for v2 spec compatibility), else OpenAI
function getModel(): string | ReturnType<ReturnType<typeof createOpenAI>["chat"]> {
  const azureUrl = process.env.AZURE_OPENAI_CHAT_URL;
  const azureKey = process.env.AZURE_OPENAI_API_KEY;

  if (azureUrl && azureKey) {
    const url = new URL(azureUrl);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const deploymentIdx = pathParts.indexOf("deployments");
    const deployment = deploymentIdx >= 0 && pathParts[deploymentIdx + 1]
      ? pathParts[deploymentIdx + 1]
      : "gpt-5";
    const baseURL = `${url.origin}/openai/deployments/${deployment}`;
    const apiVersion = url.searchParams.get("api-version") || "2025-01-01-preview";

    const openai = createOpenAI({
      baseURL,
      apiKey: azureKey,
      headers: { "api-key": azureKey },
      fetch: (input: string | URL | Request, init?: RequestInit) => {
        const urlStr = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
        const u = new URL(urlStr);
        u.searchParams.set("api-version", apiVersion);
        const opts: RequestInit | undefined = input instanceof Request
          ? { method: input.method, headers: input.headers, body: input.body }
          : init;
        return fetch(u.toString(), opts);
      },
    });
    return openai.chat(deployment);
  }

  // COPILOT_CHAT_MODEL e.g. openai/gpt-4o-mini for lower latency; default keeps quality.
  return process.env.COPILOT_CHAT_MODEL?.trim() || "openai/gpt-4o";
}

const AGENT_PROMPT = `You use MCP tools from connected servers. Follow each tool's description.

Hold entries: get_hold_entry_options → collect answers → preview_hold_entry → create_record only after user confirms.
Search: resolve_datasource for MO/batch. Speak in plain language; hide schema keys and internal IDs.`;

function getMaxSteps(): number {
  const n = Number(process.env.AGENT_MAX_STEPS);
  if (Number.isFinite(n) && n >= 1 && n <= 50) return Math.floor(n);
  return 20;
}

const builtInAgent = new BuiltInAgent({
  model: getModel(),
  prompt: AGENT_PROMPT,
  mcpServers: getMcpServers(),
  maxSteps: getMaxSteps(),
});

const runtime = new CopilotRuntime({
  agents: { default: builtInAgent },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });
  return handleRequest(req);
};
