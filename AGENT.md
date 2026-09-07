# AGENT.md — Guidance for future agents

This repo was converted from a single-file prototype (`ai_guided_writing.html`) to a production React app. Read this before making changes.

## Prime directive

**Do not add or remove features.** The studio is feature-frozen at prototype parity. The landing page is new but must remain open-source marketing only — no paywalls, no fake pricing, no additional app features. Ask before any major decision.

## Stack

- Vite + React 18 + TypeScript + React Router
- Tailwind CSS 3, Framer Motion, marked
- 100% client-side; no backend. All persistence is `localStorage` via `src/lib/storage.ts` (keys prefixed `scribe_`).

## Where things live

- `src/pages/Landing.tsx` — open-source landing, scroll-animated (BlurFade, Marquee, DotPattern)
- `src/pages/Studio.tsx` — 3-panel studio; owns all mutable state (apiBase, apiKey, model, prompt, draft, metrics, live analysis). Keep it that way — ponytail efficiency prefers local state over extra contexts.
- `src/lib/api.ts` — `SYSTEM_PROMPT`, `fetchModels`, `testConnection`, `streamCritique` (SSE parsing). This is the single source of truth for API behavior.
- `src/lib/storage.ts` — `KEYS` and `getLS`/`setLS`. Add new keys here, not ad hoc.
- `src/components/magicui/` — vendored MagicUI patterns (Marquee, ShimmerButton, DotPattern, BlurFade, BorderBeam). Headers note attribution. Full MagicUI repo is cloned to `/magicui` for reference only.
- `src/index.css` — design tokens (`:root` / `.dark`), grain, `.prose-ai`.
- `assets/Icon/` — brand source of truth (`logo.png` light, `logo_dark.png` dark, `icon.png` mark); copied to `public/` (`logo.png`, `logo-dark.png`, `icon.png`) for serving as header logo, favicon, apple-touch-icon, webmanifest + OG image. Header swaps logo by theme; do not reintroduce a text wordmark in the header.

## Design system

- Aesthetic: **The Editor's Desk** — editorial broadsheet on the Solar Workshop palette: warm paper `#FFFBF5` / ink `#0F1419` / solar amber `#FF6B35` (`--accent-ink` for AA-safe small amber text). Mono marginalia (`Nº`, folio labels), hairline rules, editor's pencil marks, blinking block caret as product glyph. Avoid generic AI purple gradients, emoji icon tiles, and badge pills.
- Fonts: Bricolage Grotesque (display), DM Sans (UI), Newsreader (draft serif), JetBrains Mono (code). Loaded via Google Fonts in `index.html`.
- Tokens are CSS variables in `index.css`; Tailwind extends them in `tailwind.config.js`. Prefer `style={{ color: "var(--text)" }}` for theme-aware colors.

## Behavior to preserve

1. Live analysis: **8-word minimum**, **1.5 s debounce** after `input`, fingerprint dedupe (`prompt:::draft`), `AbortController` cancels prior stream, streams via `fetch` + `reader.read()` + `data:` line parsing, `temperature: 0.3`, renders with `marked`.
2. Auto-save: **600 ms** debounce to `localStorage` for `scribe_draft` + `scribe_prompt`; `Save Settings` writes `scribe_api_base` / `scribe_api_key` / `scribe_model`.
3. Metrics: `words = split(/\s+/).filter(Boolean).length`, `chars = trim().length`, `read = ceil(words/200)`.
4. Theme: `document.documentElement.classList.toggle("dark")` + `scribe_theme` in localStorage.
5. File import: `FileReader.readAsText`, immediately updates draft and schedules analysis.
6. Saved prompts: JSON array at `scribe_saved_prompts`, deduped.

## Responsiveness

- Desktop: `lg:grid-cols-[300px_1fr_380px]` with `lg:h-[calc(100vh-56px)]` and independent scroll.
- Mobile: stacked, with `Write` / `Live Critique` tabs and collapsible settings drawer (`showSettings`). Do not reintroduce a 3-col grid on mobile.

## Skills — strict regulation

- **hallmark:** no AI slop (`delve`, `tapestry`, `elevate`, `seamless`, `unlock`, `unleash`, `dive into`, etc.). Write like a person.
- **impeccable:** proofread all user-facing copy; keep punctuation and casing consistent.
- **frontend-design:** commit to a bold direction; avoid system-font stacks and purple gradients. Use `DotPattern`, `BlurFade`, etc. intentionally, not as decoration.
- **ponytail:** delete indirection. One module per concern, no wrapper-for-wrapper’s-sake. If you can do it with `useState` + `useEffect`, don’t add a library.
- **magicui:** vendor components as source; keep attribution headers; do not `npm install magicui` as a black box.

## Commands

```bash
npm run dev      # dev server
npm run build    # tsc -b && vite build → dist/
npm run lint     # oxlint
```

## Docs

- `README.md` — user-facing overview
- `manifest.json` — machine-readable work log
- `.claude/CLAUDE.md` — Claude entry point (references this file)

## When in doubt

Stop and ask the maintainer. Do not decide major design or feature changes alone.
