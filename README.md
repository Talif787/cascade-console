# Cascade Console

The operator console for the Cascade control plane. Next.js (App Router) with
TypeScript and Tailwind, talking to the FastAPI backend through a same-origin
Backend-for-Frontend proxy so the JWT never reaches client JavaScript.

## Architecture

- Server Components fetch initial data through `lib/api/server.ts`, which attaches
  the base URL and bearer token server-side.
- Client components call the same-origin proxy at `/api/cascade/*`
  (`app/api/cascade/[...path]/route.ts`), which forwards to the backend and adds
  auth server-side. See `lib/api/client.ts`.
- Types come from the backend OpenAPI schema. Run `npm run gen:api` against the
  running API to generate `lib/api/schema.d.ts`, then migrate `lib/api/types.ts`
  to reference it.

## Local development

1. Run the backend with auth disabled:

   ```bash
   # in the repo root
   CASCADE_AUTH_ENABLED=false make run
   ```

2. Configure and start the console:

   ```bash
   cd frontend
   cp .env.example .env.local        # defaults to http://localhost:8000
   npm install
   npm run dev
   ```

3. Open http://localhost:3000. The Overview page shows live control-plane health.

## Scripts

- `npm run dev` local dev server
- `npm run build` production build
- `npm run typecheck` TypeScript check
- `npm run lint` ESLint
- `npm run gen:api` regenerate typed API schema from the backend

## Roadmap

- F1 Foundation: shell, BFF proxy, typed client, live health (this phase)
- F2 Serving views and Copilot
- F3 Governance (SLOs, cost, lineage)
- F4 Data platform (pipelines, contracts, ingestion, processing)
- F5 MCP catalog, auth flow, and deployment
