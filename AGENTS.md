# Agent Instructions (AGENTS.md)

This repository is optimized for autonomous AI agents (OpenHands, Claude Code, Cursor, etc.). Follow these rules strictly to ensure architectural consistency and code quality.

## 1. Core Architecture: Shared/Features/App

We follow a strict 3-layer architecture with one-way data flow: **Shared -> Features -> App**.

- **Shared (`src/shared/`)**: Global, reusable code. Foundational components, hooks, utils, and API clients.
- **Features (`src/features/`)**: Encapsulated business logic. Each feature is a self-contained folder (e.g., `src/features/auth/`).
- **App (`src/app/`)**: The application core. Pages, routing, and global shell logic. **No feature logic allowed here.**

### Import Rules:
- `shared` can ONLY import from `shared`.
- `feature` can import from `shared` or its OWN folder. **No cross-feature imports.**
- `app` can import from `shared` and `features`.

## 2. Mandatory Workflow

1. **Design First**: Before writing code, create a `DESIGN_PLAN.md` outlining your proposed changes and architectural impact.
2. **Component Creation**: UI components should be placed in `src/shared/components/ui/` if they are general, or `src/features/<name>/components/` if feature-specific.
3. **shadcn/ui**: Use `npx shadcn-ui@latest add [component] --yes` to add new components. Do NOT manually copy-paste shadcn code unless necessary.
4. **Verification**: Always run `npm run verify` before finishing a task to ensure linting and typechecking pass.

## 3. Automation Commands

- `npm run dev`: Start development server.
- `npm run build`: Build production bundle.
- `npm run verify`: Run linting and typechecking (Mandatory check).
- `npm run lint:fix`: Automatically fix linting issues.
- `npm run format`: Format code using Prettier.

## 4. UI/Design Standards
- **Styling**: Tailwind CSS only. No custom CSS modules unless absolutely required.
- **Icons**: Lucide React.
- **Typography**: Optimized Inter/browser-default.
- **Complexity**: Prefer small, modular components over large monolithic files.

<!-- lovabee-cloud:start -->
## 5. Backend (Lovabee Cloud)

This project has a real backend: Supabase (Postgres, Auth, Storage) plus server routes in `functions/` served at `/api`. It is already connected. **Extend it, never re-create it.**

### Rules (non-negotiable)
1. **Auth:** never write your own auth, sessions, JWT or password handling. Use `src/features/auth`: `AuthProvider` (already wraps the app), `useAuth()`, `useSignOut()`, `<AuthGuard>` for protected pages, and the existing `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/account` pages. Restyle them freely.
2. **Schema changes:** every change is a **new** file in `supabase/migrations/` named like `0003_add_orders.sql`. Never edit a migration that has already been applied: add another one.
3. **Row Level Security:** every `create table` must be followed in the same file by `alter table <name> enable row level security;` and policies scoped to the user, e.g. `using (auth.uid() = user_id)`. A table only `/api` touches gets `-- lovabee:service-only <name>` instead of policies. Deliberately public data gets `-- lovabee:public-read <name>` above its `using (true)` select policy.
4. **Apply and type:** run `npm run db:push` after writing a migration, then `npm run db:types` to refresh `src/shared/types/database.ts`. A migration that drops or rewrites data is paused until the user approves it: tell them; do not work around it.
5. **Where code goes:** read and write data from the browser with `supabase` (`src/shared/lib/supabase.ts`) and let RLS protect it. Only add a route in `functions/` when it needs a secret, a webhook or a third-party API. Call it with `apiFetch('/your-route')` (`src/shared/lib/api.ts`), which sends the user's session.
6. **Secrets:** never put a secret key in `src/` (it ships to the browser; `npm run lint` fails on it). In `functions/`, read secrets from `c.env.NAME`. If a feature needs a key the user hasn't added (e.g. `STRIPE_SECRET_KEY`, `RESEND_API_KEY`), say so and ask them to add it in Lovabee Cloud settings.
7. **Admin client:** `createAdminClient(c.env)` bypasses RLS. Use it only in `functions/`, only for work the user can't do themselves, and always filter by `c.get('user').id`.

### What is already built
| Need | Use |
|---|---|
| Current user / session | `useAuth()` from `src/features/auth` |
| Protect a page | wrap it in `<AuthGuard>` |
| Profile data | `profiles` table (one row per user, created on signup) |
| Stripe checkout / billing portal | `<CheckoutButton priceId="price_...">`, `<BillingPortalButton>`, `useSubscription()` from `src/features/billing` |
| Subscription state | `subscriptions` table, kept in sync by `POST /api/webhooks/stripe` |
| Send email from the server | `sendEmail(c.env, { to, subject, html })` in `functions/_lib/email.ts` |
| New server route | add to `functions/_lib/app.ts` (Hono), protect with `requireUser` |

### Commands
- `npm run verify`: typecheck (app + functions), lint, secret scan, `lint:sql`. Must pass.
- `npm run db:push` / `npm run db:types`: apply migrations / regenerate DB types.
- `npm run dev:api`: runs `functions/` on :8788; Vite proxies `/api` to it.
<!-- lovabee-cloud:end -->
