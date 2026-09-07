# ScribeAI — Intelligent Writing Practice Studio

Live, private AI writing coach. Paste a prompt, write your draft, and get streaming critique the moment you pause. 100% open-source, client-side only — your API key never leaves the browser.

![ScribeAI](public/favicon.svg)

> Ported from a single-file prototype (`ai_guided_writing.html`) to a production React app. No features were added or removed — the goal was responsiveness, polish, and deploy-readiness.

## Why this exists

Writing improves with tight feedback loops. ScribeAI keeps you in flow: no analyze button, no tab switching. You type → it listens → critique streams back when you pause (1.5 s debounce, 8-word minimum).

## Features (frozen — 1:1 with prototype)

- **API Settings** — Base URL, API key, model selector with `Refresh` (`/models`) and `Test` (`/chat/completions`), `Save Settings` persisted to `localStorage`
- **Task / Prompt** — textarea + `Save` + `Load saved…` dropdown (persisted array)
- **Draft editor** — serif writing surface, word/char/read-time metrics, live indicator (`Ready` / `Typing (needs 8+ words)` / `Typing…` / `Live: Updating…` / `Up to date` / `API error`), auto-save every 600 ms, `.txt`/`.md` import
- **Live Critique** — status badge (`Listening` / `Reviewing…` with pulse / `Live` / `Error`), empty state, streaming Markdown rendered with `marked`, abort-on-type via `AbortController`, deduped by fingerprint, SSE parsing
- **Chrome** — header with theme toggle and `Clear All Data`, toasts, light/dark via CSS variables

## Tech stack

- **Vite + React 18 + TypeScript**
- **React Router** — `/` landing, `/app` studio
- **Tailwind CSS 3**
- **Framer Motion** — scroll reveals, marquee, shimmer
- **marked** — Markdown rendering
- **MagicUI patterns** — vendored as source under `src/components/magicui/` (`Marquee`, `ShimmerButton`, `DotPattern`, `BlurFade`, `BorderBeam`); currently unused by the pages but kept for reference. Original design system lives in `/magicui` (cloned per request) and is attributed below.

## Getting started

```bash
# install
npm install

# dev
npm run dev        # http://localhost:5173

# production build
npm run build
npm run preview
```

No backend, no env file required. All config lives in the Studio sidebar and `localStorage`.

### Using the coach

1. In **Studio** (`/app`) set **Base URL** (e.g. `https://api.openai.com/v1`, `http://localhost:11434/v1` for Ollama, LM Studio) + **API Key** if needed + **Model**, hit **Save Settings** → **Test**.
2. Paste a prompt in **Task / Prompt** (optionally **Save** it).
3. Write in **Draft**. After 8 words and a pause, **Live Critique** streams: Scorecard, Strengths, Next Steps, Concrete Suggestion.
4. **Import** a `.txt`/`.md` file or **Clear All Data** from the header.

## Project structure

```
src/
  App.tsx                 Router + theme bootstrap
  main.tsx
  index.css               Design tokens, grain, prose-ai
  lib/
    storage.ts            KEYS + localStorage helpers
    api.ts                SYSTEM_PROMPT, fetchModels, streamCritique
    utils.ts              cn()
  hooks/useToast.ts
  components/
    ui/Toast.tsx
    magicui/              Marquee, ShimmerButton, DotPattern, BlurFade, BorderBeam
    layout/               SiteHeader, SiteFooter
  pages/
    Landing.tsx           Open-source landing with scroll animation
    Studio.tsx            3-panel studio (1:1 feature parity)
```

## Design notes

- **Principle: freeze features.** Nothing added, nothing removed — only layout and polish changed.
- **Aesthetic: The Editor's Desk** — editorial broadsheet language on the Solar Workshop palette: warm paper `#FFFBF5`, ink `#0F1419`, solar amber `#FF6B35` with an AA-safe `--accent-ink` for small amber text. Mono marginalia (`Nº 01`), hairline rules, folio labels, editor's pencil marks (`.mk-strike` / `.mk-ins` / `.mk-note`), a blinking block caret as the product glyph, and serif Newsreader italic accents. No emoji icon tiles, badge pills, blobs, or fake browser chrome. Type: **Bricolage Grotesque** (display), **DM Sans** (UI + italic), **Newsreader** (draft + italic accents), **JetBrains Mono** (marginalia + code).
- **Responsiveness:** desktop 3-col (`300px 1fr 380px`); tablet/mobile collapses to stacked layout with `Write` / `Live Critique` tabs and collapsible settings drawer. Editor and critique panels scroll independently on desktop, naturally on mobile.
- **Hallmark / Impeccable:** copy is direct, human, no AI filler (“delve”, “tapestry”, “elevate”, “seamless” etc. are avoided). Grammar and punctuation audited.
- **Ponytail:** one `storage.ts`, one `api.ts`, no over-abstracted contexts or prop-drilling layers. Studio holds state locally; effects are explicit and debounced with `setTimeout`/`AbortController` as in the prototype.

## Deployment

Static build — deploy `dist/` to Vercel, Netlify, Cloudflare Pages, or any static host:

```bash
npm run build
# then upload dist/
```

## Attribution

- MagicUI — https://magicui.design — components vendored under MIT. Full registry cloned to `/magicui` for reference (as requested). Individual components in `src/components/magicui/` note their origin.
- Prototype HTML preserved as `ai_guided_writing.html` for audit.

## License

MIT. Fork, self-host, change the system prompt.

## Docs for agents

- `AGENT.md` — guidance for future agents working in this repo
- `.claude/CLAUDE.md` — Claude-specific entry point referencing `AGENT.md`
- `manifest.json` — machine-readable work log of this conversion
