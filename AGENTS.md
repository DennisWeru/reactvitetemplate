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
