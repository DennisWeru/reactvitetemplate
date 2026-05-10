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

## 2026-04-20: Default Model Update to Xiaomi Mimo V2 Pro

### Decision
Changed the default AI model used across the Lovabee UI and background agent from Google Gemini 3.1 Flash to `xiaomi/mimo-v2-pro`.

### Rationale
Requested by the user to align the platform with the Xiaomi Mimo V2 Pro model for all generation tasks by default.

### Action Taken
1.  **UI Updates**: Updated `app/page.tsx` and `app/generate/[projectId]/page.tsx` to use `xiaomi/mimo-v2-pro` as the default state and fallback.
2.  **API Updates**: Updated `api/projects` and `api/generate-daytona` routes to default to the new model during project creation and environment setup.
3.  **Agent Runner**: Updated `agent_runner.py` to use the new model as the default LLM.
4.  **Agent Logic**: Updated `claude-code-main` configurations (`configs.ts` and `model.ts`) to register and recognize the new model, including display and marketing name mappings.

## 2026-05-11: Switching to BrowserRouter for Anchor Link Support

### Decision
Switched the template from `HashRouter` to `BrowserRouter` and updated the Vite `base` path to `/`.

### Rationale
URLs containing a `#` (e.g., `abc.com/#about`) were failing with a 404 error because `HashRouter` treats the fragment as a route path. Switching to `BrowserRouter` allows standard HTML anchor links to function correctly while maintaining clean URLs.

### Action Taken
1.  **Router Update**: Replaced `createHashRouter` with `createBrowserRouter` in `src/app/router.tsx`.
2.  **Vite Config**: Updated `base: './'` to `base: '/'` in `vite.config.ts` to ensure absolute asset paths, which is required for correct `BrowserRouter` behavior on sub-routes.
