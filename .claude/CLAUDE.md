# CLAUDE.md — Claude entry point

This repository is a production React conversion of a writing-coach prototype. For all agent guidance, read `../AGENT.md` — it is the single source of truth and is kept in sync with this file.

## Quick orientation

- **Stack:** Vite + React 18 + TypeScript + React Router + Tailwind + Framer Motion + marked
- **Routes:** `/` → `src/pages/Landing.tsx` (open-source landing), `/app` → `src/pages/Studio.tsx` (feature-frozen studio)
- **Persistence:** `localStorage` only via `src/lib/storage.ts` (`scribe_*` keys)
- **API:** OpenAI-compatible, streaming SSE in `src/lib/api.ts`
- **Design:** The Editor's Desk (editorial broadsheet on Solar Workshop tokens) in `src/index.css` + `tailwind.config.js`; MagicUI patterns in `src/components/magicui/` (currently unused by pages); full MagicUI repo cloned to `/magicui` for reference

## Rules

1. **Freeze features** — do not add or remove studio features. Ask before any major decision.
2. **Strict skills:** hallmark (no AI slop), impeccable (proofread), frontend-design (bold, not generic), ponytail (minimal abstraction), magicui (vendored with attribution).
3. **Sync with AGENT.md** — if you update guidance here, update `../AGENT.md` and vice versa.

See `../AGENT.md` for full detail, file map, and behavior to preserve.
