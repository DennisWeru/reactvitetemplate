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
```

## Key Files for Agents:
- **`AGENTS.md`**: Core rules and architectural guidelines.
- **`package.json`**: Dependency list and automation scripts.
- **`tailwind.config.js`**: UI theme and styling configuration.
- **`tsconfig.json`**: TypeScript project rules.
- **`docs/Decisions.md`**: Historical context and project decisions log.
