# MCP Schema UI Server

A standalone MCP server that fetches schemas from MongoDB and provides a basic HTML form renderer for Claude. Claude can display the form in an artifact and the user can modify the UI.

## Tools

- **list_schemas** – List all active schemas from MongoDB. Use to discover schema keys.
- **get_schema** – Get schema by key (field definitions, options, autopopulate). Use when you only need the schema.
- **get_schema_with_react_base** – Get schema + full React base code (SchemaForm.tsx, types, API client). User can customize colors, typography, positions.

## Setup

1. Copy `.env.example` to `.env` or use the parent project's `.env` (MONGODB_URI, MONGODB_DB).
2. Install and run:

```bash
cd mcp-schema-ui
npm install
npm run build
npm start
```

For development:

```bash
npm run dev
```

Server runs on port 3200 by default. MCP endpoint: `http://localhost:3200/mcp`.

## Connect to Claude

Add this MCP server to your Claude Desktop or Cursor MCP config. Use the HTTP transport with URL `http://localhost:3200/mcp`.
