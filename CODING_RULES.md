# Coding Rules for This Project

A concise checklist to keep our codebase consistent, fast, and safe.

## General
- Prefer TypeScript strictness; avoid `any` unless absolutely necessary with a short comment.
- Keep components small and focused; extract helpers when a component exceeds ~150 lines or has unrelated concerns.
- Write pure functions where possible; isolate side effects (I/O, globals).
- Favor composition over inheritance; prefer hooks + utilities over deep prop drilling.
- Avoid silent failures: log with context or surface errors to the UI; never swallow caught exceptions.

## Styling & UI
- Stick to existing design tokens and Tailwind classes; do not inline hex colors unless adding to the design system.
- Keep hover/focus states accessible; ensure focus rings are present (use `focus-visible`).
- Images: add `alt` text, use `loading="lazy"` for below-the-fold media.
- Keep animation subtle (<300ms) and avoid motion on essential interactions (form submit, nav).

## Data & State
- Centralize constants in `src/lib/constants.ts`; avoid magic strings/numbers.
- For remote data, handle loading, empty, and error states explicitly.
- Memoize expensive derived data with `useMemo`/`useCallback` only when necessary (profiling/props churn).
- When adding store state, ensure default values and reset paths are clear; avoid hidden singletons.

## Accessibility & i18n
- All interactive elements must be reachable by keyboard; use semantic elements (`button`, `a`) with proper `type`.
- Provide visible labels or `aria-label` for icon-only controls.
- Add copy to translation files instead of hardcoding strings; default to French if undecided.

## Testing & Quality
- Add a quick regression test when fixing a bug or adding complex logic; prefer lightweight unit tests over snapshot churn.
- Keep console clean; remove `console.log`/`debugger` before commit.
- Run lint/format before pushing; align with repo ESLint/Prettier settings.

## Performance
- Avoid unnecessary rerenders: pass stable refs/handlers to children.
- Lazy-load heavy routes/assets where it doesn’t hurt UX.
- When mapping lists, use stable keys (ids, not indices).

## Git & Changes
- Never revert user changes; coordinate instead.
- Keep commits focused and descriptive; no “wip” once shared.

## Security
- Never commit secrets; use env vars and `.env.example`.
- Validate user input on both client and server; avoid trusting params from the URL without checking.

## Documentation
- Comment only for intent or non-obvious decisions; avoid narrating the obvious.
- Update README or relevant docs when you change setup steps or major behaviors.
