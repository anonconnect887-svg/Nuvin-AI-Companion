# Nuvin

Nuvin is a consent-first native companion for everyday support, medication reminders, emotional reflection, and private memory keeping.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/nuvin/` — Expo iOS and Android app
- `artifacts/api-server/` — shared Express API server
- `lib/api-spec/openapi.yaml` — shared API contract
- `artifacts/nuvin/constants/colors.ts` — mobile theme tokens

## Architecture decisions

- Age is asked privately during setup and stored locally on the device. It selects Nuvin's tone and text sizing automatically; never expose persona labels or a persona switcher.
- The first preview keeps memories, profile age, reminder state, and sample chat history in local storage.
- Voice interaction and emergency dispatch are previews only; the app does not currently play voice audio, send caregiver alerts, or share live location.

## Product

Nuvin offers a single tab-free conversation space, accessible typography, a voice-state orb, medicine reminder actions, a categorized Memory Vault with instant deletion, crisis helpline links, and a safety preview with a cancellable countdown.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
