# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
ThresHOLD is a metadata-driven quality hold management system with three TypeScript services. See `frontend/README.md` and `mcp-schema-ui/README.md` for detailed docs.

### Services and ports

| Service | Directory | Port | Dev command |
|---------|-----------|------|-------------|
| MCP REST API | `MCP/` | 3000 | `npm run dev` |
| MCP HTTP (MCP protocol) | `MCP/` | 3100 | `npm run mcp:http` (uses compiled JS — run `npm run build` first) |
| Frontend (Next.js) | `frontend/` | 3001 | `npm run dev` |
| MCP Schema UI (optional) | `mcp-schema-ui/` | 3200 | `npm run dev` |

### MongoDB required
All backend services require MongoDB on `localhost:27017`. Install via:
```
sudo apt-get install -y mongodb-org
```
Start with:
```
mongod --dbpath /data/db --fork --logpath /tmp/mongod.log
```

### Startup order
1. Start MongoDB
2. Seed data: `cd MCP && npm run seed` (idempotent — safe to re-run)
3. Start MCP REST API: `cd MCP && npm run dev`
4. Start MCP HTTP server: `cd MCP && npm run mcp:http` (requires `npm run build` first)
5. Start frontend: `cd frontend && npm run dev`

### Key caveats
- The `mcp:http` script runs compiled JS from `dist/`, so you must `npm run build` in `MCP/` before running it. The `dev` script (REST API) uses `tsx watch` and does not need a build step.
- The frontend requires `OPENAI_API_KEY` in `frontend/.env` for AI chat features to work. Without it, the UI loads but chat queries will fail.
- `.env` files are gitignored. Each service needs its own `.env` — see `frontend/.env.example` and `mcp-schema-ui/.env.example` for templates. MCP backend needs `MONGODB_URI` and `MONGODB_DB`.
- The frontend ESLint config has not been initialized yet — `npm run lint` will prompt for interactive setup. Use `npx tsc --noEmit` for type checking instead.
- Tests: `cd MCP && npm test` (vitest). Only the MCP backend has automated tests.
- The frontend has a pre-existing TS error in `src/components/FormPanel.tsx` (line 86, type cast). This does not affect runtime.
