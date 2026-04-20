# Decisions Log - Template Setup

## 2026-04-20: Template Initialization

### Decision
Initialized the `template` folder by cloning the official `reactvitetemplate` and removing Git metadata.

### Rationale
To provide a clean, standardized starting point for new generation projects, as requested by the user and documented in the project's historical decisions.

### Action Taken
1. Cloned `https://github.com/DennisWeru/reactvitetemplate.git` into `/Users/dennisweru/Desktop/Code/CursorExperiments/Lovaclone/template`.
2. Removed the `.git` directory to isolate the template from its source repository.

## 2026-04-20: Boilerplate and i18n Removal

### Decision
Stripped the template of all boilerplate content, i18n configurations, and default styles to provide a "blank white page" starting point.

### Rationale
To ensure the AI agent begins with a clean slate, avoiding interference from pre-existing starter code and styles as requested by the user.

### Action Taken
1.  **Removed i18n**: Deleted `src/shared/lib/i18n`, `src/types/i18next.d.ts`, and `src/types/resources.ts`. Removed i18n initialization from `src/main.tsx` and usage from `ErrorPage`.
2.  **Cleaned Home Page**: Emptied `src/app/pages/home/index.tsx` to a simple `<div />` wrapper.
3.  **Updated Layout**: Removed `<Header />` from `src/app/layouts/layout/index.tsx` and ensured a clean white background.
4.  **Deleted Boilerplate**: Removed `about` page, and components like `hero`, `header`, and `language-selector`.
5.  **Reset Styles**: Stripped extra styles from `src/styles/globals.css` while maintaining shadcn/tailwind base.

## 2026-04-20: Agent Capability Refinements

### Decision
Optimized the template for maximum compatibility with autonomous AI agents (specifically OpenHands).

### Rationale
To leverage OpenHands' full capabilities, the repository must provide clear, concise, and machine-readable instructions. Consolidating rules into `AGENTS.md` and providing a `MAP.md` reduces token usage and "hallucinations" while ensuring the agent follows the intended architecture.

### Action Taken
1.  **Instruction Centralization**: Created `AGENTS.md` to serve as the master source of truth for architectural rules, mandatory workflows, and automation commands.
2.  **Navigation Enhancement**: Created `MAP.md` to provide a high-level overview of the repository structure.
3.  **Rule Sync**: Updated `.cursor/rules/project-rules.mdc` to align with `AGENTS.md` and removed outdated internationalization instructions.
4.  **Automation Hardening**: Updated `package.json` with a mandatory `verify` script (`npm run lint && npm run typecheck`) and a `format` script.
5.  **Dependency Cleanup**: Removed the remaining `i18n` dependencies to keep the workspace lean and focused.
