# Elecnor project rules

This project uses Next.js Pages Router. Keep dashboard routes in `pages/` and HTTP
API adapters in `pages/api/`; do not create `src/app/` routes.

The business core is in `src/backend/`. Domain and application code must not import
Next, React, database clients, or outbound adapters. Wire dependencies only in
`src/backend/composition/`.

Use Brain 5.0.1 manifests in `.hc/`, TDD for behavior, and keep authored files at
99 physical lines or fewer. Never add real data, secrets, SQLite files, or direct
browser-to-backend/database calls.

Before work, run `hc context` and load the returned `story_path`. Use `hc tdd` for
RED/GREEN/REFACTOR evidence and run `hc verify` before declaring DONE.

## NP migration rule

For every NP, first inspect the legacy repositories and record the affected
bounded contexts, routes, data contracts, dependencies, tests, and risks. Then
project only the authorized behavior into this repository: Pages Router for the
dashboard, `pages/api` for the BFF, and `src/backend` for domain/application/
ports/adapters. Preserve legacy evidence; do not copy legacy debt, real data,
SQLite, secrets, or undocumented behavior.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
