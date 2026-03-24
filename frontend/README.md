# ThresHOLD Chatbot Frontend

Copilot Kit–based chatbot that connects to the ThresHOLD MCP server for schema, datasource, and form management.

## Architecture

- **Frontend**: Next.js + CopilotKit (React)
- **MCP server(s)**: One or more MCP HTTP servers – tools from all are available
- **REST API**: ThresHOLD Express backend (port 3000) – schemas, datasources, hold-entries

The chatbot uses CopilotKit’s Built-in Agent with configurable MCP servers. All tools from all connected MCPs are available. **Easy MCP integration**: add MCP URLs to `mcp.json`—each MCP brings its tool descriptions automatically.

## Prerequisites

1. **MCP server** running on port 3100:
   ```bash
   cd ../MCP && npm run mcp:http
   ```

2. **REST API** (optional, for direct API use) on port 3000:
   ```bash
   cd ../MCP && npm run dev
   ```

3. **OpenAI API key** for the Built-in Agent.

## Setup

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```

2. Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```

3. **MCP servers** – easiest: edit `mcp.json` in the frontend root:
   ```json
   {
     "servers": [
       { "url": "http://localhost:3100/mcp", "type": "http" },
       { "url": "https://other-mcp.example.com/mcp", "type": "http" }
     ]
   }
   ```
   Or use plain URLs: `"servers": ["http://localhost:3100/mcp"]`
   Each MCP exposes its tools with full descriptions—the agent uses them automatically.

4. Install dependencies (if not already done):
   ```bash
   npm install
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3001](http://localhost:3001) and use the chat sidebar.

## Features

- **Schema**: Get schema by key
- **Datasource**: Resolve datasources (search, lookup, paginate)
- **Hold entries**: Create, list, search, and preview hold entries
- **Form creation**: Conversational flow with options and validation
- **Back-and-forth**: Chat-based interaction for all operations

## REST API Proxy

The frontend exposes a proxy to the ThresHOLD REST API at `/api/mcp-rest/*` (same validation rules as MCP tools; logic lives in the MCP server package).

- `GET /api/mcp-rest/schemas/:schemaKey` – Get schema
- `GET /api/mcp-rest/datasources/:datasourceKey` – Datasource metadata (same idea as `get_datasource`)
- `POST /api/mcp-rest/datasources/:datasourceKey/resolve` – Resolve datasource
- `POST /api/mcp-rest/hold-entries/preview` – Preview hold (same rules as `preview_hold_entry`)
- `POST /api/mcp-rest/hold-entries` – Create hold entry
- `GET /api/mcp-rest/hold-entries` – List hold entries
- `GET /api/mcp-rest/hold-entries/:holdId` – Get hold entry

Validation errors return HTTP **400** with `{ error, issues }` on the REST API; MCP tools return `isError` with a plain-language list for the model.

Set `MCP_REST_URL=http://localhost:3000` in `.env` if the REST API runs on a different host.

## MCP Tools Available

| Tool | Description |
|------|-------------|
| `get_schema` | Retrieve schema by key |
| `get_datasource` | Get datasource metadata |
| `resolve_datasource` | Search/lookup datasource |
| `get_hold_entry_options` | Show dropdown choices for hold creation |
| `get_hold_entry_workflow` | Step-by-step hold creation flow |
| `preview_hold_entry` | Preview before submission |
| `create_record` | Submit hold entry |
| `list_hold_entries` | Search and list holds |
| `get_hold_entry` | Get single hold by ID |
