# Repository Map (MAP.md)

A quick guide to finding things in the LovaBee Template repository.

```text
src/
├── app/                  # Application Layer (Routing, Pages, Global Shell)
│   ├── layouts/          # Broad layout wrappers
│   ├── pages/            # Page-level components
│   └── router.tsx        # Main routing configuration
├── features/             # Feature Layer (Business logic, feature UI)
│   └── [feature_name]/   # e.g., auth, products, dashboard
│       ├── components/   # Feature-specific UI
│       ├── hooks/        # Feature-specific state/logic
│       ├── server/       # Feature-specific server actions/API logic
│       └── types/        # Feature-specific type definitions
├── shared/               # Shared Layer (Reusable building blocks)
│   ├── components/       # Global UI (ui/, header/, error-page/, etc.)
│   ├── hooks/            # Global utility hooks
│   ├── lib/              # Global libraries (utils.ts, env.ts)
│   ├── styles/           # Global styles (globals.css)
│   └── types/            # Global type definitions
├── main.tsx              # Application Entry Point
└── vite-env.d.ts         # Vite Environment Types

functions/                # Server routes (Cloudflare Pages Functions, Hono), served at /api
├── api/[[route]].ts      # Mounts the Hono app; don't add routes here
└── _lib/                 # app.ts (routes), env.ts, supabase.ts (requireUser, admin client), billing.ts, email.ts
supabase/migrations/      # SQL migrations, applied in filename order by `npm run db:push`
scripts/                  # lint-migrations, db-push, db-types, dev-api, check-secrets, apply-cloud-overlay
```

Backend entry points: `src/features/auth` (auth UI + hooks), `src/features/billing` (Stripe),
`src/shared/lib/supabase.ts` (browser client), `src/shared/lib/api.ts` (`apiFetch` for /api),
`src/shared/types/database.ts` (generated DB types).

## Key Files for Agents:
- **`AGENTS.md`**: Core rules and architectural guidelines.
- **`package.json`**: Dependency list and automation scripts.
- **`tailwind.config.js`**: UI theme and styling configuration.
- **`tsconfig.json`**: TypeScript project rules.
- **`docs/Decisions.md`**: Historical context and project decisions log.
